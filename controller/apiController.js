const dbController = require('./dbController')
const artController = require('./artController')
const jwt = require('jwt-simple')
const jwtSecret = "ThIsIsMySuP3rS3cUr3S4Lt"
const {User} = require("../model/User");
const {artworkMap} = require("../model/Artwork");

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
            res.status(200)
            res.json({token: newToken})
        }).catch(err => res.status(422).send("Invalid Credentials"));
}

const getAllArt = (req, res) =>{
    res.contentType = "application/json";
    const artwork = [...artworkMap.values()]
    res.status(200).json(artwork)
}

const addDonation = (req, res) => {
    return artController.postArt(req, res);
}

module.exports = {
    addDonation,
    getToken,
    getAllArt,
}