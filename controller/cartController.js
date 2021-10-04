const {artworkMap} = require("../model/Artwork");


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

const deleteFromCart = (req, res) => {
    const artwork_id = req.params.artwork_id;
    req.session.cart = req?.session?.cart?.filter(art => art.id !== artwork_id)
    res.end("ok")
}


module.exports = {
    addToCart,
    deleteFromCart
}