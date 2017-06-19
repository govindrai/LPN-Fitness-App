// Modules
var express = require('express'),
	pug = require('pug'),
	path = require('path');

// Models
var User = require('./../models/user'),
	Family = require('./../models/family');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	Family.find({}).then((families) => {
		User.find({}).populate('family').then((users) => {
			res.render('users/index', {families, users});
		});
	});
});

router.post('/', (req, res, next) => {
	var user = new User(req.body);
	user.save().then((user) => {
		user.generateAuthToken().then((token) => {
				res.redirect('/families');
		});
	}).catch(e => console.log(err));
});

// initialize new user, if save successful,
// generate auth token and take to home page
router.post('/', (req, res, next) => {
	var user = new User(req.body);

	user.save().then((user) => {
		user.generateAuthToken().then((token) => {
				res.redirect('/families/');
		});
	}).catch(e => console.log(err));
});

router.put('/edit', (req, res) => {
	var user, currentAdmin;
	if (req.body.changeAdmin) {
		User.findById(req.body.user)
		.then(foundUser => {
			user = foundUser;
			currentAdmin = user.admin;
			if (req.body.changeAdmin) {
				user.admin = !user.admin;
				return user.save();
			}
		})
		.then(() => {
			var message = currentAdmin ? "is no longer an admin" : "is now an admin";
			res.send(`${user.fullName} ${message}`);
		})
		.catch(e => console.log(e));
	} else {
		User.findOneAndUpdate({_id: res.locals.user._id}, {$set: req.body}, {runValidators: true, new: true})
		.then(user => {
			res.send(pug.renderFile(path.join(__dirname, '../views/users/_edit_form.pug'), {message: "Your profile has been updated!", user}));
		}).catch(e => console.log(e));
	}
});

module.exports = router;
