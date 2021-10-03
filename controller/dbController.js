const {MongoClient} = require("mongodb");
const mongo = require('mongodb');
const scrypt = require('scrypt-js');
const {Artwork} = require("../model/Artwork")
const {User} = require("../model/User")

//test

/*Generic admin client with access with read-write access to every collection in
the database. Should be used for debugging, rather than general use.*/
const admin_uri = "mongodb+srv://admin:admin1@app.g1swe.mongodb.net"
const admin = new MongoClient(admin_uri);

/*Admin client for creating accounts and logging a user in. Read-Write access to
users*/
const login_uri = "mongodb+srv://login:login@app.g1swe.mongodb.net"
const login_admin = new MongoClient(login_uri);

/*Admin client used to add and remove art from the artworks collection, and handle
donations. Has read-Write access to artworks and donations, and read access to users.*/
const art_uri = "mongodb+srv://art:art@app.g1swe.mongodb.net"
const art_admin = new MongoClient(art_uri);

/*Admin client for handling orders and purchases. has read access to artworks and users,
and read-write access to orders.*/
const purchase_uri = "mongodb+srv://purchases:purchases@app.g1swe.mongodb.net"
const purchase_admin = new MongoClient(purchase_uri);

const salt = "AllYourBaseRBelongToUs";
const N = 1024, r = 8, p = 1;
const salt_buffer = Buffer.from(salt, 'utf-8');
const dkLen = 32;
let hashed_password;

/*Salts and hashes a string into a secure form using the scrypt algorithm. Returns
the salted and hashed password as a string.

password: String to be converted into a hash
*/
function hash(password) {

    let password_buffer = Buffer.from(password, 'utf-8');
    let hashed_buffer = scrypt.syncScrypt(password_buffer, salt_buffer, N, r, p, dkLen);
    hashed_password = new TextDecoder().decode(hashed_buffer);

    return (hashed_password);

}

/*Returns a json document for a given id and collection. All mongodb
collections contain an ID column called '_id', allowing this function to return
any document from any collection.

ID: String form of the ID of the document being searched for
collection: String, name of the collection the document is in
*/
async function get(id, collection, client = admin) {

    try {

        await client.connect();

        let object_id = new mongo.ObjectID(id);
        let item = await client.db('NWEN304').collection(collection).findOne({_id: object_id});

        return item;

    } finally {
        await client.close();
    }

}

/*Returns a String consisting of the ID of the provided object. Useful as MongoDB
does not store document ID's as strings.

document: JSON document from a MongoDB collection
*/
function get_ID(document) {
    let object_id = document._id;
    let id = object_id.toString();

    return id;
}

/*Generic query function, returns either a single json objectt that matches the
query, or an array of all json objects that match the query in the collection.

You shouldn't need to use this, there should be functions that do the specific things
you need them to do.

collection: String, name of the collection the document is in
query: Object, key-value pairs to search the collection for. Please refer to
documentation for structure of documents in each collection.
single: Boolean, whether the function returns a single element or an array of
elements. Single search is faster, and should be used when only a single entry
is expected to be in the collection that matches the query.
*/
async function query(collection, query, single = false, client = admin) {

    try {

        await client.connect();

        let result;

        if (single) {
            result = await client.db("NWEN304").collection(collection).findOne(query);
        } else (
            result = await client.db("NWEN304").collection(collection).find(query).toArray()
        )

        return (result);

    } finally {
        await client.close();
    }

}

/*Updates the document corresponding to the ID in the given collection with the
given update. Backend function that can change anything aside from _id, not for
general use.

You shouldn't need to use this, there should be functions that do the specific things
you need them to do.

ID: String form of the ID of the object to be updated
collection: String, name of the collection the target document is in
update: Object key-pair, new value for the document
*/
async function update_document(id, collection, update, client = admin) {

    let object_id = new mongo.ObjectID(id);
    query = {
        _id: object_id
    };

    try {

        await client.connect();
        await client.db("NWEN304").collection(collection).updateOne(query, {$set: update});

    } finally {
        await client.close();
    }

}

/*Tries to find the given username in the list of users, and if the username is
not used, hashes teh given password and adds a new user to the users collection.
Throws 'username_taken' if the username is not unique.

username: String, the users proposed username
password: String, unhashed unsalted plain text password
f_name: StringL, the users first name
l_name: String, the users last name
admin: Boolean, determines whether the account is to be an admin account,
or a regular account
*/
async function add_user(username, password, f_name, l_name, admin = false) {

    try {
        await login_admin.connect();

        let in_database = await login_admin.db('NWEN304').collection('users').findOne({username: username});
        if (in_database) {
            throw 'username_taken';
        } else {

            hashed_password = hash(password);

            let new_user = {
                first_name: f_name,
                last_name: l_name,
                username: username,
                password: hashed_password,
                admin: admin
            };

            await login_admin.db('NWEN304').collection('users').insertOne(new_user);
            return new User(new_user);
        }

    } finally {
        await login_admin.close();
    }

}

/*Checks the username password pair and, if a match is found, returns the json
document consisting of the users information.
Throws 'username_not_found' if no user with the given username is found in the
users collection
Throws 'passwords_do_not_match' if the password associated with the given username,
and the given password do not match

username: String, the users username
password: String, the users password
*/
async function user_login(username, password) {

    try {

        await login_admin.connect();

        let account = await login_admin.db('NWEN304').collection('users').findOne({username: username});

        if (account) {

            let test_password = hash(password);
            if (test_password == account.password) {

                return new User(account);

            } else {
                throw 'passwords_do_not_match';
            }

        } else {
            throw 'username_not_found'
        }

    } finally {
        await login_admin.close();
    }

}

/*Adds (or replaces) a given o-auth token for a specific website onto the document
for the given user in the users collection. It can handle any website you give it
so you don't need to worry about them being froma  specific list or anything, and
each account can handle unlimited websites.
Throws 'user_not_found' if no user with a matching ID is found in the collection

user_id: String form of the ID of the user who you want to add an o-auth token for.
website: String, name of or other identifier for the website the token is for.
token: String, the o-auth token to be saved.
*/
async function add_oauth_token(user_id, website, token){

  let web_name = website + '_token';
  update = {};

  update[web_name] = token;

  let response = await update_document(user_id, "users", update, login_admin);

  if (response.matchedCount == 0) {
    throw 'user_not_found';
  }

}

/*Searches the users collection for a user with a matching ID, and returns the
o-auth token for the requested website.
Throws 'user_not_found' if no user with a matching ID is found in the collection

user_id: String form of the ID of the user you want the o-auth token of.
website: String, the identifier you used when you added the o-auth token.
*/
async function get_oauth_token(user_id, website){

  let response = await get(user_id, "users", login_admin);

  if (!response) {
    throw 'user_not_found';
  }

  let web_name = website + '_token';
  token = response[web_name];

  if (!token) {
    throw 'website_not_found';
  }

  return(token);

}

/*Adds an artwork to the collection of artworks

author: String, the name of the author of the artwork
description: String, a description of the artwork
url: String, A url to the artwork, used to display the artwork on the site
price: Number, the price of the artwork, should be to two decimal places
*/
async function add_art(author, description, url, price) {
    let new_art = {
        author: author,
        description: description,
        media_url: url,
        price: price,
        purchased: false
    };

    try {

        await art_admin.connect();

        let artwork = await art_admin.db("NWEN304").collection("artworks").insertOne(new_art);

        return (new Artwork(artwork));

    } finally {
        await art_admin.close();
    }

}

/*Checks to make sure if all of the given ID's have matches in teh artworks
collection, and if so, returns the combined price of the artworks to two DP.
Throws a 'art_{artwork_id}_not_found' if any of the supplied id's do not match an
artwork in the collection.

artwork_ids: array of Strings, the id's of the artworks to be checked.
*/
async function check_artworks(artwork_ids, client = admin) {

    let price = 0.0;

    for (let id in artwork_ids) {

        let art = await get(artwork_ids[id], "artworks", client);

        if (!art) {
            throw 'art_' + artwork_ids[id] + '_not_found';
        }

        if (art.purchased) {
            throw 'art_' + artwork_ids[id] + '_not_available_for_purchase';
        }

        price = price + art.price;

    }

    price = price.toFixed(2);

    return (price);

}

/*Checks to make sure the provided artowrk and user ID's match entries in their
respective collections. If so, adds the order to the list of orders. Uses the
function check_artworks().
Throws 'user_not_found' if the provided user_id does not correspond to a user in
the users collection.

user_id: String version of the ID of the user making the order
artwork_ids: array of Strings, the id's of the artworks being ordered

NOTE: Create companion function that removes artworks once an order is complete,
OR add "purchased / available" flag to artworks that are ordered, so cant be ordered
twice.
*/
async function add_order(user_id, artwork_ids) {

    try {

        let user = await get(user_id, "users", purchase_admin);

        if (!user) {
            throw 'user_not_found';
        }

        //artworks have probably already been checked by this point but it's safer to check again
        let price = await check_artworks(artwork_ids, purchase_admin);

        let new_order = {
            user_id: user_id,
            artwork_id: artwork_ids,
            price: price
        };

        for (let id in artwork_ids) {
            await update_document(artwork_ids[id], "artworks", {purchased: true}, purchase_admin);
        }

        await purchase_admin.connect();

        await purchase_admin.db("NWEN304").collection("orders").insertOne(new_order);

    } finally {
        await purchase_admin.close();
    }

}

/*Takes a user ID and the information to create an artwork, checks to make sure
the user is in the users collection and if so, creates and adds the artwork to
artworks collection, and an entry in the donations collection. Uses the add_art()
function.
Throws 'user_not_found' if the provided user_id does not correspond to a user in
the users collection.

user_id: String, the ID of the user making the donation
author: String, the name of the author of the donated artwork
description: String, a description of the donated artwork
url: String, A url to the donated artwork
price: Number, the price of the donated artwork
*/
async function add_donation(user_id, author, description, url, price) {

    try {

        let user = await get(user_id, "users", art_admin);

        if (!user) {
            throw 'user_not_found';
        }

        let artwork = await add_art(author, description, url, price);
        let artwork_id = artwork.insertedId.toString();

        let new_donation = {
            user_id: user_id,
            artwork_id: artwork_id
        };

        await art_admin.connect();

        await art_admin.db("NWEN304").collection("donations").insertOne(new_donation);

    } finally {
        await art_admin.close();
    }

}

/*Removes a user, and any orders / donations associated with them.

user_id: String form of the ID of the user to be removed
*/
async function remove_user(user_id) {

    try {

        query = {
            user_id: user_id
        }

        await art_admin.connect();
        await art_admin.db("NWEN304").collection("donations").deleteMany(query);

        await purchase_admin.connect();
        await purchase_admin.db("NWEN304").collection("orders").deleteMany(query);

        let object_id = new mongo.ObjectID(user_id);
        let user_query = {
            _id: object_id
        }

        await login_admin.connect();
        await login_admin.db("NWEN304").collection("users").deleteOne(user_query);

    } finally {
        await art_admin.close();
        await purchase_admin.close();
        await login_admin.close();
    }

}

/*Checks through the donations and the order collection for the artwork ID. If it
is not found, deletes the artwork specified by the artwork_id.
Throws 'artwork_in_orders' if the artowrk ID is in the array artwork_id within any order
Throws 'artwork_in_donations' if the artwork ID is in the collection orders

artwork_id: String form of the ID of the artwork to be deleted.
*/
async function remove_artwork(artwork_id) {

    try {

        let in_donations = await query("donations", {artwork_id: artwork_id}, true);
        if (in_donations) {
            throw "artwork_in_donations";
        }

        let in_orders = await query("orders", {artwork_id: {$elemMatch: {$eq: artwork_id}}}, true);
        if (in_orders) {
            throw "artwork_in_orders";
        }

        let object_id = new mongo.ObjectID(artwork_id);
        query = {
            _id: object_id
        }

        await art_admin.connect();
        await art_admin.db("NWEN304").collection("artworks").deleteOne(query);

    } finally {
        await art_admin.close();
    }

}

/*Removes a donation from the donaitions collection specified by donation_id
*/
async function remove_donation(donation_id) {

    let object_id = new mongo.ObjectID(donation_id);
    query = {
        _id: object_id
    }

    try {

        await art_admin.connect();
        await art_admin.db("NWEN304").collection("donations").deleteOne(query);

    } finally {
        await art_admin.close();
    }

}

/*Removes an order from the orders collection specified by order_id
*/
async function remove_order(order_id) {

    let object_id = new mongo.ObjectID(order_id);
    query = {
        _id: object_id
    }

    try {

        await purchase_admin.connect();
        await purchase_admin.db("NWEN304").collection("order").deleteOne(query);

    } finally {
        await purchase_admin.close();
    }

}

/*Updates the specified artwork witht he specified update.

artwork_id: String form of the ID of the artwork to be updated
update: Object key-pair, should consist only of the parts of the artwork that
are to be updated. For example, to update price should be:
{price: 10.00}
To update both price and author should be:
{price: 10.00, author: "John Smith"}

Also just now realised the word is 'artist' not 'author'. Oops.
*/
async function update_artwork(artwork_id, update) {

    await update_document(artwork_id, "artworks", update, art_admin);

}

/*Returns an array of json files consisting of all artworks in the collection*/
async function get_all_art() {

    try {

        await art_admin.connect();
        let artworkArray = (await art_admin.db("NWEN304").collection("artworks").find({}).toArray());
        return artworkArray.map(art_data => new Artwork(art_data))
    } finally {
        await art_admin.close();
    }

}


async function run() {

    //artworks = ["6153e910fdf0e27c544a3f47", "6153e928fdf0e27c544a3f48"];
    //await add_order("6153e32b7c06049ee653b013", artworks);

    let art = await get_all_art();
    console.log(art);

}

module.exports = {
    add_donation,
    add_art,
    add_user,
    add_order,
    get_all_art,
    remove_order,
    remove_user,
    remove_artwork,
    remove_donation,
    user_login,
    update_artwork
}
// run().catch(console.error);
