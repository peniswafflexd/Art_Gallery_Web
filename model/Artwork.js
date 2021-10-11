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
            if(authorOrObj.artist_nationality) this.artist_nationality = authorOrObj.artist_nationality
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

    save(userid, callback) {
        if(!this.dbController) return console.error("dbController not set!")
        if(this.isSaved) return;
        this.dbController.add_donation(userid, this.author, this.description, this.media_url, this.price)
            .then((id) => {
                this.id = id
                this.dbController.get_all_art().then(artArray => populateArtworkMap(artArray))
                this.isSaved = true;
                callback();
            }).catch(err => {
            console.error(err)
        })
    }

    update(objToUpdate){
        if(!this.dbController) return console.error("dbController not set!")
        const updateObj = {
            price: this.price,
            media_url: this.media_url,
            author: this.author,
            description: this.description,
            purchased: this.purchased,
            artist_nationality: this.artist_nationality,
            ...objToUpdate
        }
        this.dbController.update_document(this.id, "artworks", updateObj)
            .then(() => {
                this.dbController.get_all_art().then(artArray => populateArtworkMap(artArray))
            })
            .catch(err => console.log(err))
    }

    delete() {
        if(!this.dbController) return console.error("dbController not set!!");
        this.dbController.remove_artwork(this.id)
            .then(() => {
                console.log("deleting " + this.id)
                this.dbController.get_all_art().then(data => populateArtworkMap(data));
                artworkMap.delete(this.id)
            }).catch(err => {
            console.error(err);
        })
    }
}


module.exports = {
    ...module.exports,
    Artwork
}