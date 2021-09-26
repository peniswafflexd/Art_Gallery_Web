var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/registration', function(req, res) {
  res.render('pages/registration');
});

app.get('/cart', function(req, res) {
  res.render('pages/cart');
});

app.get('/donate', function(req, res) {
  res.render('pages/donate');
});

app.get('/login', function(req, res) {
  res.render('pages/login');
});

app.get('/order', function(req, res) {
  res.render('pages/order');
});




app.listen(8080);
console.log('Server is listening on port 8080');