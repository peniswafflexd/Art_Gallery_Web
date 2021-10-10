const {validationResult} = require("express-validator");
const {default: dps} = require("dbpedia-sparql-client");
const dbController = require("../controller/dbController")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const WebRoot = "https://artgallery-team7.herokuapp.com"

const handleErrors = (req, res) => {
    let errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object
    if (!errors.isEmpty()) {
        res.contentType = "application/json"
        res.status(422).json({errors: errors.array()});
        return false;
    }
    return true;
}

const sendErrorJson = (res, err) => {
    let errorString = err.toString().replace(/_/g, " ")
    res.contentType = "application/json"
    res.status(422).json({errors: [{msg: errorString}]});
}

const sendEmail = (user, token) => {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'nwengallerytesting@gmail.com',
            pass: 'gallerytesting' // naturally, replace both with your real credentials or an application-specific password
        }
    });

    const mailOptions = {
        from: 'nwengallerytesting@gmail.com',
        to: 'tinnyfacexd@gmail.com',
        subject: 'Password Reset Link',
        html: `Here is your password reset link! <a href="${WebRoot}/password-reset/new-password/${user.id}/${token}">Reset Password</a>`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const getUserGeoLocation = async (req) =>{
    const testIP = req.headers['x-forwarded-for'];
    let location = await fetch(`http://ip-api.com/json/${testIP}`)
        .then(data => data.json().then(location =>{
            return location.country.toString()
        })).catch(err => console.error(err))
    return location;
}

const setArtistNationality = async (art) => {
    //SPARQL query to get birthplace of artist
    const artist = art.author;
    let nationality = "Unknown";
    let query = `SELECT DISTINCT`+
        `?birthcountry `+
        `WHERE{ ` +
        `?agent a dbo:Artist;` +
        `dbo:birthPlace ?birthplace.` +
        `?birthplace dbo:country ?birthcountry.` +
        `?agent rdfs:label ?agent_name.` +
        `FILTER((LANGMATCHES(LANG(?agent_name), "en")) && (REGEX(?agent_name, "${artist}", "i")))` +
        `} LIMIT 1`
    let response = await dps.client()
        .query(query)
        .timeout(15000) // optional, defaults to 10000
        .asJson() // or asXml()
        .catch(err => console.error(err));
    let resultBindings = response.results.bindings;
    if(resultBindings[0]) {
        let birthplaceNameArray = resultBindings[0].birthcountry.value.split('/')
        nationality = birthplaceNameArray[birthplaceNameArray.length - 1]
        nationality = nationality.replace('_', " ")
    }
    return {artist_nationality: nationality};
}

module.exports = {
    handleErrors,
    sendErrorJson,
    sendEmail,
    setArtistNationality,
    getUserGeoLocation
}