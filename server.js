import {add_art, add_user, get_all_art, remove_artwork, update_artwork, user_login} from "./controller";

const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
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
}

//this function gets run on every request
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
    get_all_art().then(data => {
        app.locals.artwork = data
        populateArtworkMap(data)
        res.render('pages/index');
    })

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

router.post("/art", (req, res) => {
    let author = req.body.author
    let description = req.body.desc
    let media_url = req.body.media
    let price = req.body.price
    add_art(author, description, media_url, price)
        .then(data => {
            populateArtworkMap(data);
        }).catch(err => {
            console.error(err)
    })
});

router.delete("/art/:artwork_id", (req, res) => {
    let artwork_id = req.params.artwork_id
    remove_artwork(artwork_id)
        .then(() => {
            get_all_art().then(data => populateArtworkMap(data));
        }).catch(err => {
            if(err === "artwork_in_donations") res.send("Cannot delete this artwork")
            else if (err === "artwork_in_orders") res.send("Cannot delete this artwork")
            else console.error(err);
    })
})

/**
 * Returns page of the artwork from the given artwork ID in the
 * URL
 */
router.get("/art/:artwork_id", (req, res) => {
    let artwork_id = req.params.artwork_id
    let currentArtwork = artworkMap.get(artwork_id);
    if(currentArtwork){
        res.render("pages/artwork", {currentArtwork});
    }else{
        res.send("This is not a valid artwork ID");
    }
})

app.put("/art/:artwork_id", (req, res) => {
    let artwork_id = req.params.artwork_id
    let price = req.body.price
    let author = req.body.author
    let media_url = req.body.media
    let description = req.body.desc
    let update = {}
    if(price) update.price = price
    if(author) update.author = author
    if(media_url) update.media_url = media_url
    if(description) update.description = description
    console.log(update);
    update_artwork(artwork_id, update).then(data => {
        populateArtworkMap(data);
    }).catch(err => {
        console.error(err);
    })
})

router.post("/login", (req, res) => {
    let username = req.body.user
    let password = req.body.pass
    user_login(username, password)
        .then(data => {
            req.session.userid = username;
            req.session.user = data
            console.log(`${username} logged in!`);
            res.redirect("/");
        })
        .catch(err => {
            if (err === 'passwords_do_not_match') res.send("Passwords do not match")
            else if (err === 'username_not_found') res.send("Username not found")
            else console.error(err);
        })
})

router.post('/sign-up', (req, res) => {
    let username = req.body.user
    let password = req.body.pass
    let firstname = req.body.first
    let lastname = req.body.last
    add_user(username, password, firstname, lastname, false).then((data) => {
        req.session.userid = username;
        req.session.user = data
        res.redirect("/");
        console.log("New user created: " + username);
    }).catch(err => {
        if (err === 'username_taken') res.send("That username is taken");
        console.log(err)
    })
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


app.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
