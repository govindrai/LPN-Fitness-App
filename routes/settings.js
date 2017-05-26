var express = require('express');
var router = express.Router();
const mongoose = require('./../db/mongoose'); 
const {User} = require('./../models/user'); 

/* GET users listing. */

router.get('/', function(req, res, next) {
	User.getAdmins().then((admins) => {
		User.getNonAdmins().then((nonAdmins) => {
			res.render('settings/index', {admins, nonAdmins});
		})
	})
})

module.exports = router;