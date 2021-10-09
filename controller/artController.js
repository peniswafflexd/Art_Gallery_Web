const {validationResult} = require("express-validator");
const {artworkMap, Artwork} = require("../model/Artwork")
const dbController = require("./dbController");
const {setArtistNationality} = require("../utils/util")


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
    const {author, desc, media, price} = req.body
    const newArtwork = new Artwork(author, false, desc, media, price, null , false)//author, false for is saved, desc, media, price, null for id and false for is purchased
    const updateAfterSave = () => {
        setArtistNationality(newArtwork)
            .then(artistNameObj => {
                newArtwork.update(artistNameObj)
            })
    }
    newArtwork.setDBController(dbController)
    newArtwork.save(req.session.user.id, updateAfterSave);
    res.redirect("/");
};

const deleteArt = (req, res) => {
    console.log("deleting art")
    let artwork_id = req.params.artwork_id
    if(!req?.session?.user?.admin) res.send("You do not have valid permissions for this")
    let artwork = artworkMap.get(artwork_id)
    if (!artwork) res.send("Artwork ID doesn't exist");
    artwork.setDBController(dbController)
    artwork.delete();
     res.end("ok")
};

const updateArt = (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const artwork_id = req.params.artwork_id
    const {author, media, desc, price} = req.body;
    let artwork = artworkMap.get(artwork_id);
    if (price) artwork.price = price
    if (author) artwork.author = author
    if (media) artwork.media_url = media
    if (desc) artwork.description = desc
    artwork.setDBController(dbController)
    artwork.update();
    res.redirect("/")
};

module.exports = {
    getArt,
    postArt,
    deleteArt,
    updateArt
}