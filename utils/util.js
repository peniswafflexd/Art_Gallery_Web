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
        text: `Here is your password reset link!`,
        html: `Here is your password reset link! <a href="http://localhost:8080/password-reset/new-password/${user.id}/${token}">Reset Password</a>`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    handleErrors,
    sendErrorJson,
    sendEmail
}