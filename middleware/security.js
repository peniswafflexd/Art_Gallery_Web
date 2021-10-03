const {check} = require("express-validator");


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
                check('author', "author doesn't exist").isString().not().isEmpty(),
                check('desc', "Description doesn't exits").isString().not().isEmpty(),
                check('price', "Price is invalid format").isFloat().not().isEmpty(),
                check('media', "media needs to be a URL").isURL().not().isEmpty(),
            ]
        }
        case 'createUser': {
            return [
                check('user', "Username required").not().isEmpty(),
                check('pass', "Password required").not().isEmpty(),
                check('first', "First name can only contain letters").not().isEmpty().isAlpha(),
                check('last', "Last name can only contain letters").not().isEmpty().isAlpha(),
            ]
        }
        case 'loginUser': {
            return [
                check('user', "Username required").not().isEmpty(),
                check('pass', "Password required").not().isEmpty(),
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

const isLoggedIn = (req, res, next) =>{
    if(req.session?.user?.id) next();
    else res.redirect("/login")
}

const isAdmin = (req, res, next) => {
    if(req.session?.user?.admin) next();
    else res.redirect("/")
}


module.exports = {
    validate,
    updateLocals,
    isLoggedIn,
    isAdmin
}