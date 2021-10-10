const {validationResult} = require("express-validator");
const {artworkMap, Artwork} = require("../model/Artwork")
const dbController = require("./dbController");
const {setArtistNationality} = require("../utils/util")

/**
 * Gets a single art item from the ID in the
 * URL and displays it to the user
 * @param req
 * @param res
 */
const getArt = (req, res) => {
    const artwork_id = req.params.artwork_id
    let currentArtwork = artworkMap.get(artwork_id);
    if (currentArtwork) {
        res.render("pages/artwork", {currentArtwork, admin: req?.session?.user?.admin});
    } else {
        res.send("This is not a valid artwork ID");
    }
};

/**
 * Adds a donation to the database,
 * also dynamically gets the artists
 * nationality and stores it in the database
 * @param req
 * @param res
 */
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
    newArtwork.save(req.user.id, updateAfterSave);
    if(req.token) {
        res.contentType = "application/json"
        res.status(200).json({msg: "Operation Successful", artwork: newArtwork})
    } else res.redirect("/");
};

/**
 * deletes a piece of art if it is not in
 * a donation or an order
 * @param req
 * @param res
 */
const deleteArt = (req, res) => {
    console.log("deleting art")
    res.contentType = "application/json"
    let artwork_id = req.params.artwork_id
    let artwork = artworkMap.get(artwork_id)
    if (!artwork) res.status(422).json({err: "Artwork ID doesn't exist"});
    artwork.setDBController(dbController)
    artwork.delete();
     res.status(200).end("ok")
};

/**
 * Updates a piece of art
 * @param req
 * @param res
 */
const updateArt = (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const artwork_id = req.params.artwork_id
    const {author, media, desc, price, nationality} = req.body;
    let artwork = artworkMap.get(artwork_id);
    if (price) artwork.price = price
    if (author) artwork.author = author
    if (media) artwork.media_url = media
    if (desc) artwork.description = desc
    if (nationality) artwork.artist_nationality = nationality

    artwork.setDBController(dbController)
    artwork.update([]);
    res.redirect("/")
};

const getUpdate = (req, res) => {
    const artwork_id = req.params.artwork_id
    let currentArtwork = artworkMap.get(artwork_id);
    if (currentArtwork) {
        res.render("pages/updateArtwork", {currentArtwork, admin: req?.session?.user?.admin});
    } else {
        res.send("This is not a valid artwork ID");
    }
}

module.exports = {
    getArt,
    postArt,
    deleteArt,
    updateArt,
    getUpdate
}