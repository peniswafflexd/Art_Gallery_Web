const {isLoggedIn} = require("../middleware/security");
const express = require("express");
const orderController = require("../controller/orderController");
const orderRouter = express.Router()


orderRouter.get('', isLoggedIn, orderController.getOrder);

orderRouter.post('', isLoggedIn, orderController.addOrder)

orderRouter.get('/:id', isLoggedIn, orderController.getSingleOrder)
module.exports = {
    orderRouter
}