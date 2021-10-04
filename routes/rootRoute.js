const express = require("express");
const rootController = require("../controller/rootController");
const rootRouter = express.Router()
const authController = require("../controller/authController")
const {validate, isAdmin, isLoggedIn} = require("../middleware/security");

/**
 * Logs a user in, and redirects them to the index page
 */
rootRouter.post("/login", validate('loginUser'), authController.postLogin)

/**
 * creates a new user document and logs the user in before
 * redirecting them to the index page
 */
rootRouter.post('/sign-up', validate('createUser'), authController.postSignup);


rootRouter.get('/logout', isLoggedIn, rootController.logout);

rootRouter.get('/sign-up', rootController.signup);

rootRouter.get('/cart',isLoggedIn, rootController.cart);

rootRouter.get('/donate', isLoggedIn, rootController.donate);

rootRouter.get('/login', rootController.login);

rootRouter.get('', rootController.root)

module.exports = {
    rootRouter
}