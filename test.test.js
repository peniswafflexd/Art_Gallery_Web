const expect = require('chai').expect;
const {User} = require("./model/User");
const jwt = require('jwt-simple')
const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require("./server");

// Configure chai
chai.use(chaiHttp);
chai.should();
before(async () => await mongoConnect())
after(async () => await mongoDisconnect())

let assert = require('assert')
const {mongoConnect, mongoDisconnect} = require("./controller/dbController");

/**
 * check that if using admin credentials then get admin jwt token
 */
describe("Admin Auth Token", () => {
    describe("POST /api/new-token", () => {
        it("Should return a new admin token", (done) => {
            chai.request(app)
                .post('/api/new-token')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({username: 'testAdmin', password: 'testAdmin'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('token')
                    const token = res.body.token
                    const payload = jwt.decode(token, 'nosecret', true);
                    payload.should.have.property('id');
                    payload.should.have.property('username')
                    payload.should.have.property('admin')
                    payload.admin.should.equal(true)
                    done();
                });
        });
    })
})


/**
 * check that if using non-admin credentials then get non-admin jwt token
 */
describe("Non-Admin Auth Token", () => {
    describe("POST /api/new-token", () => {
        it("Should return a new non-admin token", (done) => {
            chai.request(app)
                .post('/api/new-token')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({username: 'nonAdmin', password: 'nonAdmin'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('token')
                    const token = res.body.token
                    const payload = jwt.decode(token, 'nosecret', true);
                    payload.should.have.property('id');
                    payload.should.have.property('username')
                    payload.should.have.property('admin')
                    payload.admin.should.equal(false)
                    done();
                });
        });
    })
})

/**
 * Check that an array of art is returned
 */
describe("Get All Art", () => {
    describe("GET /api/art", () => {
        it("Should return a JSON array of art", (done) => {
            chai.request(app)
                .get('/api/art')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.map(e=>(e.author))).to.include("Devon");
                    expect(res.body.length).to.be.gt(10)
                    done();
                });
        });
    })
})