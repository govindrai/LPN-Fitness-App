const expect = require('expect');
const request = require('supertest');
const app = require('./../../routes/index'); 

it('should render the index page', (done) => {
	request(app)
		.get('/')
		.expect(200)
		.end(done);
}); 