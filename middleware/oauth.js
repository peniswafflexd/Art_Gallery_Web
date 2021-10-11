// const express = require("express");
// const oauthRouter = express.Router()
//
// let access_token = "";
//
// oauthRouter.get('/github', function(req, res) {
//   res.render('pages/githubOauth',{client_id: clientID});
// });

// Import the axios library, to make HTTP requests
// const axios = require('axios')
// This is the client ID and client secret that you obtained
// while registering on github app
// const clientID = 'c5f7827886b1acd5c1aa'
// const clientSecret = '2e2c0bf6ea2432e0edf8cec59445b96a55c266a3'

// Declare the callback route
// oauthRouter.get('/github/callback', (req, res) => {
//
//   // The req.query object has the query params that were sent to this route.
//   const requestToken = req.query.code
//
//   axios({
//     method: 'post',
//     url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
//     // Set the content type header, so that we get the response in JSON
//     headers: {
//          accept: 'application/json'
//     }
//   }).then((response) => {
//     access_token = response.data.access_token
//     res.redirect('/oauth/success');
//   })
// })
//
// oauthRouter.get('/success', function(req, res) {
//
//   axios({
//     method: 'get',
//     url: `https://api.github.com/user`,
//     headers: {
//       Authorization: 'token ' + access_token
//     }
//   }).then((response) => {
//     res.render('pages/success',{ userData: response.data });
//   })
// });
// //
// // module.exports = {
// //   oauthRouter
// // }