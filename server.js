const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
module.exports = {app}
const {get_all_art} = require("./controller/dbController");
const {populateArtworkMap} = require("./controller/modelController")
const {updateLocals} = require("./middleware/security")
const {artRouter} = require("./routes/artRoute")
const {rootRouter} = require("./routes/rootRoute")
const {cartRouter} = require("./routes/cartRoute")
const {orderRouter} = require("./routes/orderRoute");
const {populateValidCountries} = require("./utils/util");
// creating 24 hours from milliseconds
const ONE_DAY = 1000 * 60 * 60 * 24;

//session middleware
// let session;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: {maxAge: ONE_DAY},
    resave: false,
}));

app.use(express.static(__dirname + '/public'));

//initialise the body-parser middleware for post requests
// app.use(function(req, res, next) {
//     req.rawBody = '';
//     req.on('data', function(chunk) {
//         req.rawBody += chunk;
//     });
//
//     req.on('end', function() {
//         next();
//     });
// });
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// cookie parser middleware
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

//set the highest level router
app.use("/", updateLocals, rootRouter);
app.use("/art",updateLocals, artRouter)
app.use("/cart",updateLocals, cartRouter)
app.use("/order", updateLocals, orderRouter)

// app.locals.user = {ID: null}

app.listen((process.env.PORT || 8080), () => {
    get_all_art().then(data => {
        // app.locals.artwork = data
        populateArtworkMap(data)
        app.locals.user = {};
    })
    console.log('Server is listening on port 8080');
});


