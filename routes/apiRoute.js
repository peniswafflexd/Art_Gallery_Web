const {validate, hasJWT} = require("../middleware/security");
const apiController = require("../controller/apiController")
const express = require("express");
const apiRouter = express.Router()
const {isLoggedIn, isAdmin} = require("../middleware/security")

apiRouter.get("/art", apiController.getAllArt)
apiRouter.post("/new-token", apiController.getToken)
apiRouter.post("/art", hasJWT, validate("createArtwork"), apiController.addDonation)

module.exports = {
    apiRouter
};