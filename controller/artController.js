const {validationResult} = require("express-validator");
const {add_donation, get_all_art, remove_artwork, update_artwork} = require("./dbController");
const {populateArtworkMap} = require("./modelController")
const {artworkMap} = require("../model/Artwork")


const getArt = (req, res) => {
    const artwork_id = req.params.artwork_id
    let currentArtwork = artworkMap.get(artwork_id);
    if (currentArtwork) {
        res.render("pages/artwork", {currentArtwork, admin: req?.session?.user?.admin});
    } else {
        res.send("This is not a valid artwork ID");
    }
};

const postArt = (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    if(!req.session.user._id) res.send("You must be logged in to donate art")
    const {author, desc, media, price} = req.body
    add_donation(req.session.user.id, author, desc, media, price)
        .then(() => {
            get_all_art().then(artArray => populateArtworkMap(artArray))
            res.send("Thanks for donating!");
        }).catch(err => {
        console.error(err)
    })
};

const deleteArt = (req, res) => {
    let artwork_id = req.params.artwork_id
    if(!req?.session?.user?.admin) res.send("You do not have valid permissions for this")
    if (!artworkMap.has(artwork_id)) res.send("Artwork ID doesn't exist");
    remove_artwork(artwork_id)
        .then(() => {
            console.log("deleting " + artwork_id)
            get_all_art().then(data => populateArtworkMap(data));
            res.end("ok")
        }).catch(err => {
        if (err === "artwork_in_donations") res.send("Cannot delete this artwork")
        else if (err === "artwork_in_orders") res.send("Cannot delete this artwork")
        console.error(err);
    })
};

const updateArt = (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const artwork_id = req.params.artwork_id
    const {author, media, desc, price} = req.body;
    let update = {}
    if (price) update.price = price
    if (author) update.author = author
    if (media) update.media_url = media
    if (desc) update.description = desc
    console.log(update);
    update_artwork(artwork_id, update).then(data => {
        populateArtworkMap(data).catch(err => console.error(err));
    }).catch(err => {
        console.error(err);
    })
};

module.exports = {
    getArt,
    postArt,
    deleteArt,
    updateArt
}