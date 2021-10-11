const {user_login, add_user, update_password} = require("./dbController");
const {handleErrors, sendErrorJson, sendEmail, getUserGeoLocation} = require("../utils/util");
const dbController = require('./dbController')
const jwt = require('jwt-simple')
const {User} = require("../model/User");
const axios = require("axios");
const {data} = require("express-session");
const jwtSecret = "ThIsIsMySuP3rS3cUr3S4Lt"

const clientID = 'c5f7827886b1acd5c1aa'
const clientSecret = '2e2c0bf6ea2432e0edf8cec59445b96a55c266a3'

let githubAccessToken = "";
/**
 * Logs a user in and creates a session for them
 * also adds their location to the session for
 * recommendations
 * @param req
 * @param res
 */
const postLogin = (req, res) => {
    if (!handleErrors(req, res)) return;
    const {user, pass} = req.body;
    user_login(user, pass)
        .then(data => {
            req.session.userid = user;
            req.session.user = data
            res.locals.user = data;
            getUserGeoLocation(req).then(location => {
                req.session.location = location
                console.log("set " + user + " location " + location)
                console.log(`${user} logged in!`);
                res.redirect("/");
            })
        })
        .catch(err => {
            sendErrorJson(res, err);
            console.error(err);
        })
}

/**
 * Creates a new user and stores it in the
 * database
 * @param req
 * @param res
 */
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

/**
 * sends the reset password page that prompts
 * for the username
 * @param req
 * @param res
 */
const getResetPassword = (req, res) => {
    res.render('pages/resetPasswordEmail');
}

const login = (req, res) => {
    res.render('pages/login', {client_id: clientID});
}

const oauthGithubCallback = (req, res) => {
    // The req.query object has the query params that were sent to this route.
    const requestToken = req.query.code

    axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
        // Set the content type header, so that we get the response in JSON
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        githubAccessToken = response.data.access_token
        res.redirect('/oauth/success');
    })
}

const oauthCallbackSuccess = (req, res) => {
    let apiURLS = [`https://api.github.com/user`,`https://api.github.com/user/emails`]
    let userData = {};
    let requests = apiURLS.map(url => axios.get(url, {
        headers: {
            Authorization: 'token ' + githubAccessToken
        }
    }))

    Promise.all(requests).then((response) => {
        userData = {response, ...userData}
    }).catch((err) => {
        console.error(err)
    }).finally(() => {
        res.render('pages/success',{ userData: userData });
    });

}


/**
 * gets the users username when resetting their
 * password and assigns them a one time dynamic
 * token and emails a reset link to the users
 * linked email address. Stores the token in
 * the user document in the database.
 * @param req
 * @param res
 */
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
    res.redirect("/login")
    // res.contentType = "application/json"
    // res.status(200).send({token: token, id: user.id})

}

/**
 * Gets the new password from the user and
 * checks the decoded token matches the user
 * token before changing the users password
 * @param req
 * @param res
 * @returns {*}
 */
const setNewPassword = (req, res) => {
    if (!handleErrors(req, res)) return;
    let token = req.body.token;
    const payload = jwt.decode(token, jwtSecret);
    if (payload.id !== req.user.id || payload.key !== req.user.resetKey) return res.send("Not valid!")
    update_password(req.user.id, req.body.pass);
    res.send("Password Reset!")
}

/**
 * gets the page to input the new password
 * on password reset. Checks to see if the
 * users token and id match with whats in the
 * URL.
 * @param req
 * @param res
 */
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
        }).catch(err => console.log("getNewPassword " + err))

}

module.exports = {
    postSignup,
    postLogin,
    getResetPassword,
    setNewPassword,
    getNewPassword,
    postResetPasswordEmail,
    login,
    oauthGithubCallback,
    oauthCallbackSuccess
}