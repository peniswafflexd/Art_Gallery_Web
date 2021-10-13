const dbController = require('./dbController')
const artController = require('./artController')
const jwt = require('jwt-simple')
const jwtSecret = "ThIsIsMySuP3rS3cUr3S4Lt"
const {User} = require("../model/User");

const getToken = (req, res) => {
    const {username, password} = req.body;
    dbController.user_login(username, password)
        .then(user => {
            const payload = {
                username: user.username,
                id: user.id,
                admin: user.admin,
            }
            const newToken = jwt.encode(payload, jwtSecret);
            res.contentType = "application/json";
            res.status(200).json({token: newToken})
        }).catch(err => res.send("Invalid Credentials"))
}

const getAllArt = (req, res) =>{
    res.contentType = "application/json";
    dbController.get_all_art()
        .then(artData => {
            res.status(200).json(artData)
        }).catch(err => res.status(500).json({err: err}))
}

const addDonation = (req, res) => {
    return artController.postArt(req, res);
}

const jwtObject = {
    username: User.Username,
    id: User.Id,
    admin: User.admin = true,
}

module.exports = {
    addDonation,
    getToken,
    getAllArt,
    jwtObject,
}