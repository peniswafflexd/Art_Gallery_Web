

class User {
    constructor(idOrObj, first, last, username, admin) {
        if(idOrObj.first_name && idOrObj.last_name && idOrObj.username && idOrObj._id){
            this.id = idOrObj._id.toString().split(`"`)[0];
            this.firstname = idOrObj.first_name;
            this.lastname = idOrObj.last_name;
            this.username = idOrObj.username;
            this.admin = idOrObj.admin;
            this.password = idOrObj.password
            this.email = idOrObj.email
            if(idOrObj.resetKey)this.resetKey = idOrObj.resetKey
        }else{
            this.id = idOrObj;
            this.firstname = first;
            this.lastname = last;
            this.username = username;
            this.admin = admin;
        }
    }
    setDBController(dbcontroller){
        this.DBController = dbcontroller;
    }
    passwordResetKey(key){
        if(!this.DBController) return console.error("DBController hasn't been set");
        this.resetKey = key;
        console.log(key)
        this.DBController.update_document(this.id, "users", {resetKey: this.resetKey})
            .catch(err => console.error(err));
    }
}

module.exports = {
    User
}