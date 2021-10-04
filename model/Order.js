const {artworkMap} = require("./Artwork");

class Order {
    constructor(user_idOrObj, price, artwork_id_array, id){
        if(user_idOrObj._id && user_idOrObj.user_id && user_idOrObj.artwork_id && user_idOrObj.price){
            this.id = user_idOrObj._id.toString().split(`"`)[0];
            this.user_id = user_idOrObj.user_id;
            this.price = user_idOrObj.price;
            this.artwork_id_array = user_idOrObj.artwork_id
        }else {
            this.user_id = user_idOrObj;
            this.id = id;
            this.price = price;
            this.artwork_id_array = artwork_id_array;
        }
        this.artwork_array = this.artwork_id_array.map(id => artworkMap.get(id));
    }
}

module.exports = {
    Order
}