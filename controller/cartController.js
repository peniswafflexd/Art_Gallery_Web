const {artworkMap} = require("../model/Artwork");


const addToCart = (req, res) => {
    const artwork_id = req.params.artwork_id
    const artworkObj = artworkMap.get(artwork_id);
    if(!req?.session?.user?.id) res.send("You need to login before purchasing artwork")
    else if (!artworkObj) res.send("Hmm we can't seem to find that artwork sorry")
    else {
        if(!req?.session?.cart) req.session.cart = [artworkObj]
        else req.session.cart = [...req.session.cart, artworkObj];
        res.redirect('/')
    }
    console.log("failed")
}

module.exports = {
    addToCart
}