const artworkMap = new Map();
module.exports = {artworkMap}
const {populateArtworkMap} = require("../controller/modelController");


/**
 * artwork entity model
 */
class Artwork {
    /**
     * takes either the 5 parameters listed or artwork
     * object as a single parameter straight from the
     * database structure
     * @param authorOrObj
     * @param desc
     * @param media
     * @param price
     * @param id
     */
    constructor(authorOrObj, isSaved, desc, media, price, id, purchased) {
        if(authorOrObj.author && authorOrObj.description && authorOrObj.price && authorOrObj._id && authorOrObj.media_url){
            this.author = authorOrObj.author;
            this.description = authorOrObj.description;
            this.price = authorOrObj.price;
            this.media_url = authorOrObj.media_url;
            this.id = authorOrObj._id.toString().split(`"`)[0]
            this.purchased = authorOrObj.purchased
        } else {
            this.author = authorOrObj;
            this.description = desc;
            this.media_url = media;
            this.price = price;
            this.id = id;
            this.purchased = purchased;
        }
        this.isSaved = isSaved;
    }

    setDBController(dbController){
        this.dbController = dbController;
    }

    save(userid) {
        if(!this.dbController) return console.error("dbController not set!")
        if(this.isSaved) return;
        this.dbController.add_donation(userid, this.author, this.description, this.media_url, this.price)
            .then(() => {
                this.dbController.get_all_art().then(artArray => populateArtworkMap(artArray))
                this.isSaved = true;
            }).catch(err => {
            console.error(err)
        })
    }

    update(){
        if(!this.dbController) return console.error("dbController not set!")
        const updateObj = {
            price: this.price,
            media_url: this.media_url,
            author: this.author,
            description: this.description,
            purchased: this.purchased
        }
        this.dbController.update(this.id, updateObj)
            .catch(err => console.log(err))
    }

    delete() {
        if(!this.dbController) return console.error("dbController not set!")
        this.dbController.remove_artwork(this.id)
            .then(() => {
                console.log("deleting " + this.id)
                this.dbController.get_all_art().then(data => populateArtworkMap(data));
                artworkMap.delete(this.id)
            }).catch(err => {
            // if (err === "artwork_in_donations")
            // else if (err === "artwork_in_orders") res.send("Cannot delete this artwork")
            console.error(err);
        })
    }
}

module.exports = {
    ...module.exports,
    Artwork
}