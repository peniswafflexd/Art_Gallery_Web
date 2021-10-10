const {check, body} = require("express-validator");
const dbController = require("../controller/dbController")
const {User} = require("../model/User");

/**
 * returns validation handler array for a method
 * @param method - String for which method you want to validate for
 * @returns validation check
 */
const validate = (method) => {
    switch (method) {
        case 'updateArtwork': {
            return [
                check('author', "author is not in string format").isString().optional(),
                check('desc', "Description  is not in string format").isString().optional(),
                check('price', "Price is invalid format").isFloat().optional(),
                check('media', "media needs to be in URL format").isURL().optional(),
            ]
        }
        case 'createArtwork': {
            return [
                check('author').isString().withMessage("Author may only contain letters").not().isEmpty().withMessage("Author field is required"),
                check('desc').isString().withMessage("Description may only contain letters").not().isEmpty().withMessage("Description field is required"),
                check('price').isFloat().withMessage("Price needs to be in float format").not().isEmpty().withMessage("Price is required"),
                check('media').isURL().withMessage("Media field must be in URL format").not().isEmpty().withMessage("Media field is required"),
            ]
        }
        case 'createUser': {
            return [
                check('user').not().isEmpty().withMessage("Username required").custom((value, {req}) => {
                    return dbController.check_username(req.body.user).then(result => {
                        if (result) throw new Error("Username Taken")
                    })
                }),
                check('pass').not().isEmpty().withMessage("Password required").isLength({min: 8}).withMessage("Password must be minimum 8 characters"),
                check('first').not().isEmpty().withMessage("First Name Required").isAlpha().withMessage("First name can only contain letters"),
                check('last').not().isEmpty().withMessage("Last Name Required").isAlpha().withMessage("Last name can only contain letters"),
                check('email').not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid format")
            ]
        }
        case 'loginUser': {
            return [
                check('user', "Username required").not().isEmpty(),
                check('pass', "Password required").not().isEmpty(),
            ]
        }
        case 'checkUserExists': {
            return [
                check("user").not().isEmpty().withMessage("Username must be supplied").custom((value, {req}) => {
                    return dbController.check_username(req.body.user).then(result => {
                        if (!result) throw new Error("That Username doesn't exist")
                        else req.user = result;
                    })
                })
            ]
        }
        case 'newPassword': {
            return [
                check('pass').not().isEmpty().withMessage("Password required").isLength({min: 8}).withMessage("Password must be minimum 8 characters"),
                check('pass2').not().isEmpty().withMessage("Password required").custom((value, {req}) => {
                    if (req.body.pass !== value) throw new Error("Passwords need to match!")
                    else return true;
                }),
                check('id').custom((val, {req}) => {
                    return dbController.get(val, 'users').then(userData => {
                        if (!userData) throw new Error("Not a valid ID!")
                        else {
                            req.user = new User(userData)
                            return true;
                        }
                    })
                }),
                check('token').not().isEmpty().withMessage("JWT Token expected!")
            ]
        }
    }
}

/**
 * this function gets run on every request
 * it sets a global variable to the users userid to check if they're logged in
 */

const updateLocals = (req, res, next) => {
    res.locals.user = req.session.user
    next();
}

const isLoggedIn = (req, res, next) => {
    if (req.session?.user?.id) next();
    else res.redirect("/login")
}

const isAdmin = (req, res, next) => {
    if (req.session?.user?.admin) {
        console.log("User is an admin")
        next();
    } else {
        console.log("User is NOT an admin")
        res.redirect("/")
    }
}


module.exports = {
    validate,
    updateLocals,
    isLoggedIn,
    isAdmin
}