const express = require("express");
const cartController = require("../controller/cartController")
const {isLoggedIn} = require("../middleware/security");
const cartRouter = express.Router()


cartRouter.post('/:artwork_id', isLoggedIn, cartController.addToCart)

module.exports = {
    cartRouter
}