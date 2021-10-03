const {updateLocals} = require("../utils/util");
const {app} = require("../server");
const {artworkMap} = require("../model/Artwork");
const {check_artworks} = require("./dbController");


const signup = (req, res) => {
    res.render('pages/registration');
}
const cart = (req, res) => {
    let price = 0;
    if(req.session.cart){
        let cartArtworkIds = req.session.cart.map(art => art.id)
        check_artworks(cartArtworkIds)
            .then(newPrice => {
                price = newPrice;
                res.render('pages/cart', {cartItems: req.session.cart, price: price});
            }).catch(err => {
                console.log(err)
                res.render('pages/cart', {cartItems: req.session.cart, price: price});
        })
    }else res.render('pages/cart', {cartItems: req.session.cart, price: price});

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