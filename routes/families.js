var express = require('express');

var Family = require('./../models/family'),
  User = require('./../models/user');

var router = express.Router(),
  verifyAuthorization = require('./../middleware/verifyAuthorization');

/* View all families */
router.get('/', function(req, res, next) {
  Family.find({}).then((families) => {
    res.render('families/index', {families});
  })
});

/* Create a new family */
router.get('/new', function(req, res, next) {
  res.render('families/new');
});

router.post('/', (req, res, next) => {
	console.log("made it here");
	var family = new Family(req.body)

	family.save().then(() => {
    res.params({added: true});
		res.redirect('/families');
	}).catch((e) => console.log(e))
});

// Family Show Page/ Authorized User Landing Page
router.get('/:family_name', verifyAuthorization, (req, res) => {
  Family.findOne({name: req.params["family_name"]})
  .then((family) => {
    res.render('families/show', {family, user: req.params.user});
  })
  .catch(e => console.log(e));
});

module.exports = router;