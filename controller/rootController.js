const {artworkMap} = require("../model/Artwork");
const dbController = require("./dbController");
const {getUserGeoLocation} = require("../utils/util");

const recommended = (req, res) => {
    let matchingArt = [];
    if(req?.session?.location) {
        matchingArt = Array.from(artworkMap.values()).filter(art => {
            if(!art.artist_nationality) return false;
            if(art.purchased) return false
            let nationality = art.artist_nationality
            if(art.artist_nationality.includes("_")) {
                nationality = art.artist_nationality.replace("_", " ")
            }
            return nationality === req.session.location
        })
    }
    res.render('pages/recommended' , {artwork: matchingArt});
}

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


const root = (req, res) => {
    let artworkObjs =[ ...artworkMap.values() ];
    artworkObjs.sort((x, y) => {
        return (x.purchased) ? 1 : -1;
    })
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
    root,
    logout,
    signup,
    recommended
}