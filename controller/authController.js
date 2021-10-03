const {validationResult} = require("express-validator");
const {user_login, add_user} = require("./dbController");
const {app} = require("../server");


const postLogin = (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
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
            if (err === 'passwords_do_not_match') res.send("Passwords do not match")
            else if (err === 'username_not_found') res.send("Username not found")
            else console.error(err);
        })
}

const postSignup = (req, res) => {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const {user, pass, first, last} = req.body;
    add_user(user, pass, first, last, false).then((data) => {
        req.session.userid = user;
        req.session.user = data
        res.locals.user = data;

        res.redirect("/");
        console.log("New user created: " + user);
    }).catch(err => {
        if (err === 'user_taken') res.send("That user is taken");
        console.log(err)
    })
}

module.exports = {
    postSignup,
    postLogin
}