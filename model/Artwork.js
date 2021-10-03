const artworkMap = new Map();

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
    constructor(authorOrObj, desc, media, price, id, purchased) {
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
        // console.log(this);
    }
}

module.exports = {
    artworkMap,
    Artwork
}