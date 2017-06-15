var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const User = require('./../models/user'); 

/* GET users listing. */

router.get('/', function(req, res, next) {
	User.getAdmins().then((admins) => {
		User.getNonAdmins().then((nonAdmins) => {
			res.render('accounts/index', {admins, nonAdmins});
		});
	});
});

router.post('/adminChange', function(req, res) {
	User.findById(req.body.User).then((user) => {
		console.log(user);
	});
});

router.get('/profile', function(req, res, next) {
	User.findOne({}).then((user) => {
		res.render('accounts/edit', {user}); 
	}).catch(e => console.log(e)); 
}); 

router.put('/profile', function(req, res, next) {
		console.log("Made it here");
		User.findOneAndUpdate({}, {$set: req.body}).then((user) => {
		res.render('accounts/edit', {user}); 
	}).catch(e => console.log(e)); 
});


module.exports = router;