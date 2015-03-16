
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest.agent('http://localhost:3001');
var fs = require('fs');
var path = require('path');

describe('Send API', function() {
    var sampleFile = '';


    it('Send Endpoint POST with CCDA', function(done) {
        var filepath = path.join(__dirname, './artefacts/CCD-sample.xml');
        api.post('/api/v1/send')
            .attach('file', filepath)
            .field('to','patient@direct.amida-demo.com')
            .field('subject', 'your health record')
            .field('message', 'please find your latest data attached')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                } else {
                    expect(res.body).to.deep.equal({});
                    done();
                }
            });
    });
});