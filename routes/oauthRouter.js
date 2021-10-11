const authController = require("../controller/authController")
const express = require("express");
const oauthRouter = express.Router()

oauthRouter.get("/github/callback", authController.oauthGithubCallback)
oauthRouter.get("/success", authController.oauthCallbackSuccess)
oauthRouter.get("/github/login", authController.githubLogin)
module.exports = {
    oauthRouter
}