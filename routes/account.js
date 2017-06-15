var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const User = require('./../models/user'); 

/* GET users listing. */

router.get('/', function(req, res, next) {
	User.findById(res.locals.user._id).then((user) => {
		res.render('users/edit', {user});
	});
});

router.get('/admin-settings', function(req, res, next) {
	User.getAdmins().then((admins) => {
		User.getNonAdmins().then((nonAdmins) => {
			res.render('account/index', {admins, nonAdmins});
		});
	});
});

router.put('/profile', function(req, res, next) {
		User.findOneAndUpdate({_id: res.locals.user._id}, {$set: req.body})
		.then(user => {
			res.render('account/index', {user});
		}).catch(e => console.log(e)); 
});


module.exports = router;