const {updateLocals} = require("../utils/util");
const {app} = require("../server");
const {artworkMap} = require("../model/Artwork");


const signup = (req, res) => {
    res.render('pages/registration');
}
const cart = (req, res) => {
    res.render('pages/cart', {cartItems: req.session.cart});
}

const donate = (req, res) => {
    res.render('pages/donate');
}

const login = (req, res) => {
    res.render('pages/login');
}

const order = (req, res) => {
    res.render('pages/order');
}

const root = (req, res) => {
    let artworkObjs =[ ...artworkMap.values() ];
    res.render('pages/index', {artwork: artworkObjs });
}

const logout = (req, res) => {
    req.session.destroy();
    res.locals.user = {}
    res.redirect('/');
}

module.exports = {
    cart,
    donate,
    login,
    order,
    root,
    logout,
    signup
}