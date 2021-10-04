const {artworkMap} = require("../model/Artwork");
const dbController = require("./dbController");


const signup = (req, res) => {
    res.render('pages/registration');
}
const cart = (req, res) => {
    let price = 0;
    if(req.session.cart){
        let cartArtworkIds = req.session.cart.map(art => art.id)
        dbController.check_artworks(cartArtworkIds)
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
    let artworks;
    dbController.donations_by_user(req.session.user.id)
        .then(idArr => {
            dbController.get_donations(idArr)
                .then(donations => {
                    artworks = donations.map(donation => artworkMap.get(donation.artwork_id));
                    res.render('pages/donate', {donations: artworks});
                })
        })
}

const login = (req, res) => {
    res.render('pages/login');
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
    root,
    logout,
    signup
}