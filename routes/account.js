var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const User = require('./../models/user'); 

/* GET users listing. */

function isAdmin(req, res, next){
	if (res.locals.user.admin) {
		next();
	} else {
    res.render('sessions/unauthorized', {message: "Only Admins have access to admin-settings you fuck"});
  }
}

router.get('/', function(req, res, next) {
	User.findById(res.locals.user._id).then((user) => {
		res.render('users/edit', {user});
	});
});

router.get('/admin-settings', isAdmin , function(req, res, next) {
	User.getAdmins().then((admins) => {
		User.getNonAdmins().then((nonAdmins) => {
			res.render('account/admin_settings', {admins, nonAdmins});
		});
	});
});

router.put('/profile', function(req, res, next) {
		User.findOneAndUpdate({_id: res.locals.user._id}, {$set: req.body})
		.then(user => {
			res.render('users/edit', {user});
		}).catch(e => console.log(e)); 
});


module.exports = router;