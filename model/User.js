

class User {
    constructor(idOrObj, first, last, username, admin) {
        if(idOrObj.first_name && idOrObj.last_name && idOrObj.username && idOrObj.admin && idOrObj._id){
            this.id = idOrObj._id;
            this.firstname = idOrObj.first_name;
            this.lastname = idOrObj.last_name;
            this.username = idOrObj.username;
            this.admin = idOrObj.admin;
        }else{
            this.id = idOrObj;
            this.firstname = first;
            this.lastname = last;
            this.username = username;
            this.admin = admin;
        }
    }
}

module.exports = {
    User
}