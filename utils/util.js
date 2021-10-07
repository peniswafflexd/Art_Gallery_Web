const {validationResult} = require("express-validator");

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

module.exports = {
    handleErrors,
    sendErrorJson
}