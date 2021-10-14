# Gallery Website

## Overview
This website is a server-side rendered Node.js website that displays artwork for
a gallery, it is written in basic javascript, HTML and CSS. It provides basic
CRUD functionality such as, creating items, hiring items, buying items and donating
items. 
The database is MongoDB

## How to use (Website)
### Basic overview
The website is fairly simple, by going to [the website](https://artgallery-team7.herokuapp.com/), 
you will be able to view all the art in the gallery. To do any other functions, such as get recommendations,
buy or donate art you will have to login, any attempt to access the other functions will automatically
redirect you to the login page.

#### Signing Up
To sign up you must pick a username (you will be told if it is not available) and input your email
(for password reset purposes) and first and last names as well as a password, the only requirement
for the password is that it is 8 characters or longer. 
You can also choose to login/sign-up with GitHub which will use OAuth to take your GitHub details and 
create your account from that.
Once you have logged in, will have access to Orders, Cart, Donations and Recommendations pages aswell.

#### Donating
If you want to donate art, then click on the donations tab and fill out the artwork form this will create 
a new artwork entry in the database, it will also show you a list of all the donations you have made at
the bottom of the page, clicking on any of these will take you to the related artwork page.

#### Ordering
If you wish to purchase artwork you may click on any of the (un-purchased) artworks in the gallery
and click the "Add to Cart" button at the bottom of the artwork page. To view the items in your
cart you must navigate to the 'Cart' page and from their you will be able to delete items from your
cart and make an order. Once an order has been made it will show up on the orders page, here you can
click on any of the orders to see a list of the artworks included and then click on each artwork to 
view its artwork page.

#### Recommendations
When a donation is made, the server automatically checks the artists name and matches it with a database
of artists in DBpedia using SPARQL, it will assign the artists nationality based on the DBpedia entry. 
This allows us to recommend you art based on your geolocation. When on the Recommendations page, the server
automatically correlates your geolocation with our artwork databases artist nationalities and serves you a 
list of art based on where you are right now. (If you're interested you can test this with a VPN)

## How to use (API)
#### Getting Art
To retrieve all the artwork in our database, you may make a GET request to the api endpoint 
https://artgallery-team7.herokuapp.com/api/art. This will return a JSON array of all of our artwork objects.
Each artwork object is in a format like this:
```javascript
{
    author: "Pablo Picasso",  //name of the artist
    artist_nationality: "Spain", //artists country of birth
    description: "The painting depicts Dora Maar, Picasso's mistress and muse.", //Short description of art
    media_url: "https://www.pablopicasso.org/images/paintings/the-weeping-woman.jpg", //image url
    price: 5000000, //price (older artwork can sometimes be in string format)
    purchased: false, //If the artwork has been purchased yet
}
```

#### Adding Art
To add artwork to the gallery via the API, you must first get an authorization token, see "Getting JWT Tokens"
below.
You may make a POST request to the API endpoint https://artgallery-team7.herokuapp.com/api/art if you wish to
add artwork, the body of your request should include the following:
```javascript
{
    author: "The artists name", 
    description: "Short description of the artwork",
    media_url: "https://www.domainWithArt.com/path/to/artwork/image", //image url
    price: 5000000, //price in number format
}
```
You must have a valid JWT authorization token in the header of the request, and it must be using the Bearer 
schema. If your post request was successful you will get a JSON response of the new artwork object 
you have added to the database.

#### Getting JWT Tokens
In order for you to use POST requests in our API you must first request an authorization token from us.
To do this you can make a POST request to the API endpoint https://artgallery-team7.herokuapp.com/api/new-token.
The body of the request must have these fields:
```javascript
{
    username: 'YourUsername', 
    password: 'yourPassword'
}
```
If your request was successful then the response will include a data in the format:
```javascript
{
    token: 'yourauthorisationtoken'
}
```
This much be attached to the Authorization header of your post request with the 
bearer schema. 
e.g.
```javascript
Authorization: 'Bearer' + yourauthorisationtoken
```
This token is valid for as long as your account with us is valid.

## Error Handling

### Web

#### Validation and Sanitization
All forms on the website are sanitized and validated at the server side using middleware, for sanitization
we are using express-mongo-sanitize which effectively strips any '$' and any other potentially dangerous
symbols from user input before it gets validated and put in the database. 
For validation, we are using express-validator witch custom checks, these make sure that use input matches
the structure and formats that we are expecting. All forms on the website are posted asynchronously to the
server and if there is any issues with the validation, the errors are sent back to the client in JSON format
which is then displayed to the user, these include things such as:
* username taken
* password must be at least 8 characters long
* wrong username or password

They are custom written error messages that provide the user with enough information to correct their mistakes
without revealing system or server related errors that an attacker could potentially take advantage of.

### API
Because of the way we implemented the validation of input forms on the web, the same validation functions 
can be used at the API layer too, this allows maximum code re-usability. The data is processed from the 
body of the message and passed through the validation methods and if there are any errors then the status 
code is set and the errors are sent via JSON array back to the client.

The entirety of the server was written in a way that should not allow error messages of system or server level
to reach the user, this increases security and creates a better user experience.

## Contributors
- Zach Williams
- Devon Gregory
- Wenyu Wang
- Chris Visser 
