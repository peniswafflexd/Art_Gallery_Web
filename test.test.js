const expect = require('chai').expect;
const {User} = require("./model/User");

// const MockExpressRequest = require('mock-express-request')
// const sinon = require('sinon')

// const {authorize} = require('/middleware/security')

const {jwtObject} = require('./controller/apiController.js');

describe('jwtObject', () => {
    it('Is an admin JWT, should be an object with a username, an Id and is admin equal to true', ()=> {
        expect(jwtObject).to.be.an(User.username);//username
        expect(jwtObject).to.be.an(User.id);//id
        expect(jwtObject).to.be.equal(true);//isadmin-boolean
    })
});

// var assert = require('assert');
// it('should return true',() =>{
// assert.equal(true,true)
// })
