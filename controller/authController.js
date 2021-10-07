const {validationResult, Result} = require("express-validator");
const {user_login, add_user} = require("./dbController");
const {app} = require("../server");
const {handleErrors, sendErrorJson} = require("../utils/util");


const postLogin = (req, res) => {
    if(!handleErrors(req, res)) return;
    const {user, pass} = req.body;
    user_login(user, pass)
        .then(data => {
            req.session.userid = user;
            req.session.user = data
            console.log(req.sessionID)
            res.locals.user = data;
            console.log(`${user} logged in!`);
            res.redirect("/");
        })
        .catch(err => {
            sendErrorJson(res, err);
            console.error(err);
        })
}

const postSignup = (req, res) => {
    if(!handleErrors(req, res)) return;

    const {user, pass, first, last} = req.body;
    add_user(user, pass, first, last, false).then((data) => {
        req.session.userid = user;
        req.session.user = data
        res.locals.user = data;

        res.redirect("/");
        console.log("New user created: " + user);
    }).catch(err => {
        console.log(err)
    })
}

module.exports = {
    postSignup,
    postLogin
}