const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();

// creating 24 hours from milliseconds
const ONE_DAY = 1000 * 60 * 60 * 24;

const TEST_CREDENTIALS = {
  username: "testuser",
  password: "testpassword"
}

//session middleware
let session;
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { maxAge: ONE_DAY },
  resave: false
}));

//initialise the boyd-parser middleware for post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// cookie parser middleware
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

//set the highest level router
app.use("/", router);
// use res.render to load up an ejs view file

// index page
router.get('', (req, res) => {
  res.render('pages/index');
});

router.get('/registration', (req, res) => {
  res.render('pages/registration');
});

router.get('/cart', (req, res) => {
  res.render('pages/cart');
});

router.get('/donate', (req, res) => {
  res.render('pages/donate');
});

router.get('/login', (req, res) => {
  session=req.session;
  if(session.userid){
    res.redirect("/");
  }else
  res.render('pages/login');
});

router.get('/order', (req, res) => {
  res.render('pages/order');
});

router.post("/login", (req, res) => {
  let username = req.body.user
  let password = req.body.pass
  if(username === TEST_CREDENTIALS.username && password === TEST_CREDENTIALS.password){
    session=req.session;
    session.userid=req.body.user;
    console.log(req.session)
    res.redirect("/");
  }
  res.send("Invalid Username or Password");
})

app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});


app.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
