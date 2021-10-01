const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const {validationResult, check} = require('express-validator');

const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const {get_all_art, add_art, remove_artwork, update_artwork, user_login, add_user, add_donation} = require("./controller");
const app = express();

// creating 24 hours from milliseconds
const ONE_DAY = 1000 * 60 * 60 * 24;

//session middleware
// let session;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: {maxAge: ONE_DAY},
    resave: false
}));

//initialise the body-parser middleware for post requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// cookie parser middleware
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

//set the highest level router
app.use("/", router);

app.locals.user = {ID: null}
const artworkMap = new Map();

/**
 * populates the artwork map when artwork page
 * is shown, runs asynchronously as to not slow
 * down connection
 * @param data - array of artwork objects
 * @returns - null
 */
const populateArtworkMap = async (data) => {
    artworkMap.clear();
    data.forEach((art) => {
        let artwork_id = art._id.toString().split(`"`)[0]
        artworkMap.set(artwork_id, art)
    })
    console.log("before: " +data.length)
    let mod = data.length % 3;
    let diff = 3 - mod;
    console.log(diff)
    if(mod !== 0){
         for(let i=0; i < diff; i++){
             data[data.length + i] = {}
         }
    }
    console.log("after: " +data.length)

    app.locals.artwork = data;
}

/**
 * returns validation handler array for a method
 * @param method - String for which method you want to validate for
 * @returns validation check
 */
const validate = (method) => {
    switch (method) {
        case 'updateArtwork': {
            return [
                check('author', "author is not in string format").isString().optional(),
                check('desc', "Description  is not in string format").isString().optional(),
                check('price', "Price is invalid format").isFloat().optional(),
                check('media', "media needs to be in URL format").isURL().optional(),
            ]
        }
        case 'createArtwork': {
            return [
                check('author', "author doesn't exist").isString().not().isEmpty(),
                check('desc', "Description doesn't exits").isString().not().isEmpty(),
                check('price', "Price is invalid format").isFloat().not().isEmpty(),
                check('media', "media needs to be a URL").isURL().not().isEmpty(),
            ]
        }
        case 'createUser': {
            return [
                check('user', "Username required").not().isEmpty(),
                check('pass', "Password required").not().isEmpty(),
                check('first', "First name can only contain letters").not().isEmpty().isAlpha(),
                check('last', "Last name can only contain letters").not().isEmpty().isAlpha(),
            ]
        }
        case 'loginUser': {
            return [
                check('user', "Username required").not().isEmpty(),
                check('pass', "Password required").not().isEmpty(),
            ]
        }
    }
}

/**
 * this function gets run on every request
 * it sets a global variable to the users userid to check if they're logged in
 */
router.use((req, res, next) => {
    app.locals.user = {ID: req.session.userid}
    next();
})

/**
 * gets all the art from the database each time page is rendered
 * will change this to get data from the local map, and only
 * update the local map when changes are made to the database
 */
router.get('', (req, res) => {
    res.render('pages/index');
});

/**
 * creates and adds a piece of artwork to the database
 */
router.post("/art", validate("createArtwork"), (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const {author, desc, media, price} = req.body
    add_donation(req.session.user._id, author, desc, media, price)
        .then(() => {
            get_all_art().then(artArray => populateArtworkMap(artArray))
            res.send("Thanks for donating!");
        }).catch(err => {
        console.error(err)
    })
});

/**
 * deletes the artwork specified by the artwork id
 */
router.delete("/art/:artwork_id", (req, res) => {
    let artwork_id = req.params.artwork_id
    if (!artworkMap.has(artwork_id)) return res.send("Artwork ID doesn't exist");
    remove_artwork(artwork_id)
        .then(() => {
            get_all_art().then(data => populateArtworkMap(data));
        }).catch(err => {
        if (err === "artwork_in_donations") res.send("Cannot delete this artwork")
        else if (err === "artwork_in_orders") res.send("Cannot delete this artwork")
        else console.error(err);
    })
})

/**
 * Updates the artwork specified by the artwork id. Takes
 * four optional parameters
 */
app.put("/art/:artwork_id", validate("updateArtwork"), (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const artwork_id = req.params.artwork_id
    const {author, media, desc, price} = req.body;
    let update = {}
    if (price) update.price = price
    if (author) update.author = author
    if (media) update.media_url = media
    if (desc) update.description = desc
    console.log(update);
    update_artwork(artwork_id, update).then(data => {
        populateArtworkMap(data).catch(err => console.error(err));
    }).catch(err => {
        console.error(err);
    })
})

/**
 * Returns page of the artwork from the given artwork ID in the
 * URL
 */
router.get("/art/:artwork_id", (req, res) => {
    const artwork_id = req.params.artwork_id
    let currentArtwork = artworkMap.get(artwork_id);
    if (currentArtwork) {
        res.render("pages/artwork", {currentArtwork});
    } else {
        res.send("This is not a valid artwork ID");
    }
})


/**
 * Logs a user in, and redirects them to the index page
 */
router.post("/login", validate('loginUser'), (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const {user, pass} = req.body;
    user_login(user, pass)
        .then(data => {
            req.session.userid = user;
            req.session.user = data
            console.log(`${user} logged in!`);
            res.redirect("/");
        })
        .catch(err => {
            if (err === 'passwords_do_not_match') res.send("Passwords do not match")
            else if (err === 'username_not_found') res.send("Username not found")
            else console.error(err);
        })
})

/**
 * creates a new user document and logs the user in before
 * redirecting them to the index page
 */
router.post('/sign-up', validate('createUser'), (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const {user, pass, first, last} = req.body;
    add_user(user, pass, first, last, false).then((data) => {
        req.session.userid = user;
        req.session.user = data
        res.redirect("/");
        console.log("New user created: " + user);
    }).catch(err => {
        if (err === 'user_taken') res.send("That user is taken");
        console.log(err)
    })
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.get('/sign-up', (req, res) => {
    res.render('pages/registration');
});

router.get('/cart', (req, res) => {
    res.render('pages/cart');
});

router.get('/donate', (req, res) => {
    res.render('pages/donate');
});

router.get('/login', (req, res) => {
    res.render('pages/login');
});

router.get('/order', (req, res) => {
    res.render('pages/order');
});


app.listen(8080, () => {
    get_all_art().then(data => {
        app.locals.artwork = data
        populateArtworkMap(data)
    })
    console.log('Server is listening on port 8080');
});

