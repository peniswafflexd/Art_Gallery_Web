const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
const mongoSanitize = require('express-mongo-sanitize');
module.exports = {app}
const {get_all_art} = require("./controller/dbController");
const {mongoConnect} = require("./controller/dbController")
const {populateArtworkMap} = require("./controller/modelController")
const {updateLocals} = require("./middleware/security")
const {artRouter} = require("./routes/artRoute")
const {rootRouter} = require("./routes/rootRoute")
const {cartRouter} = require("./routes/cartRoute")
const {orderRouter} = require("./routes/orderRoute");
const {populateValidCountries} = require("./utils/util");
const {maxAge, httpOnly} = require("express-session/session/cookie");
const {apiRouter} = require("./routes/apiRoute");
const {oauthRouter} = require("./routes/oauthRouter");
// creating 20 minutes hours from milliseconds
const TWENTY_MIN = 1000 * 60 * 20;



//session middleware
// let session;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    resave: false,
    rolling: true, //allows session rollover if user still making requests
    cookie: {
        httpOnly: true,
        maxAge: TWENTY_MIN
    }
}));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(
  mongoSanitize({
    onSanitize: () => {
      console.log("sanitized");
    },
  }),
);

// cookie parser middleware
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

//set the routers
app.use("/", updateLocals, rootRouter);
app.use("/art",updateLocals, artRouter)
app.use("/cart",updateLocals, cartRouter)
app.use("/order", updateLocals, orderRouter)
app.use("/oauth", oauthRouter)
app.use("/api", apiRouter)


//start the server
app.listen((process.env.PORT || 8080), () => {
    mongoConnect().then(() => {
      get_all_art().then(data => {
          // app.locals.artwork = data
          populateArtworkMap(data)
          app.locals.user = {};
      })
    })
    console.log('Server is listening on port 8080');
});
