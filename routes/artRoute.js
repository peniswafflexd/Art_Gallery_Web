const {validate} = require("../middleware/security");
const artController = require("../controller/artController")
const express = require("express");
const artRouter = express.Router()
const {isLoggedIn, isAdmin} = require("../middleware/security")

/**
 * creates and adds a piece of artwork to the database
 */
artRouter.post("/", isLoggedIn, validate("createArtwork"), artController.postArt);

/**
 * deletes the artwork specified by the artwork id
 */
artRouter.delete("/:artwork_id", isAdmin, artController.deleteArt)

/**
 * Updates the artwork specified by the artwork id. Takes
 * four optional parameters
 */
artRouter.post("/:artwork_id/update", isAdmin, artController.updateArt)

/**
 * Returns page of the artwork from the given artwork ID in the
 * URL
 */
artRouter.get("/:artwork_id", artController.getArt)

artRouter.get("/:artwork_id/update", isAdmin, artController.getUpdate)


module.exports = {artRouter}