const {artworkMap} = require("../model/Artwork");

/**
 * adds an item to the cart
 * @param req
 * @param res
 */
const addToCart = (req, res) => {
    const artwork_id = req.params.artwork_id
    const artworkObj = artworkMap.get(artwork_id);
    if (!artworkObj) res.send("Hmm we can't seem to find that artwork sorry")
    else {
        if (!req?.session?.cart) req.session.cart = [artworkObj]
        else req.session.cart = [...req.session.cart, artworkObj];
        res.redirect('/')
    }
    console.log("failed")
}

/**
 * Deletes an item from the cart in the users session
 * @param req
 * @param res
 */
const deleteFromCart = (req, res) => {
    const artwork_id = req.params.artwork_id;
    req.session.cart = req?.session?.cart?.filter(art => art.id !== artwork_id)
    res.end("ok")
}


module.exports = {
    addToCart,
    deleteFromCart
}