const {user_login, add_user, update_password} = require("./dbController");
const {handleErrors, sendErrorJson, sendEmail} = require("../utils/util");
const dbController = require('./dbController')
const jwt = require('jwt-simple')
const {User} = require("../model/User");
const jwtSecret = "ThIsIsMySuP3rS3cUr3S4Lt"

const postLogin = (req, res) => {
    if (!handleErrors(req, res)) return;
    const {user, pass} = req.body;
    user_login(user, pass)
        .then(data => {
            req.session.userid = user;
            req.session.user = data
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
    if (!handleErrors(req, res)) return;
    const {user, pass, first, last, email} = req.body;
    add_user(user, pass, first, last, email, false).then((data) => {
        req.session.userid = user;
        req.session.user = data
        res.locals.user = data;

        res.redirect("/");
        console.log("New user created: " + user);
    }).catch(err => {
        console.log(err)
    })
}

const getResetPassword = (req, res) => {
    res.render('pages/resetPasswordEmail');
}

const postResetPasswordEmail = (req, res) => {
    if (!handleErrors(req, res)) return;
    const user = req.user;
    //TODO: change this math.random is insecure for password
    const key = (Math.random().toString(36).slice(-8)) + user.password;
    user.setDBController(dbController);

    const payload = {
        id: user.id,
        key: key
    }
    let token = jwt.encode(payload, jwtSecret);
    sendEmail(user, token);
    user.passwordResetKey(key);
    res.contentType = "application/json"
    res.status(200).send({token: token, id: user.id})

}

const setNewPassword = (req, res) => {
    if (!handleErrors(req, res)) return;
    let token = req.body.token;
    const payload = jwt.decode(token, jwtSecret);
    if(payload.id !== req.user.id || payload.key !== req.user.resetKey) return res.send("Not valid!")
    update_password(req.user.id, req.body.pass);
    res.send("Password Reset!")
}

const getNewPassword = (req, res) => {
    const {id, token} = req.params;
    let user;
    dbController.get(id, "users")
        .then(userData => {
            if (!userData) return res.send("not valid")
            user = new User(userData);
            const payload = jwt.decode(token, jwtSecret)
            if (user.id !== id || payload.key !== user.resetKey) return res.send("Not Valid")
            res.render('pages/newPassword', {id: id, token: token})
        }).catch(err => console.log("getNewPassword "+err))

}

module.exports = {
    postSignup,
    postLogin,
    getResetPassword,
    setNewPassword,
    getNewPassword,
    postResetPasswordEmail
}