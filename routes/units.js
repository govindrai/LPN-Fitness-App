// Modules
var express = require('express');

// Models
var Unit = require('./../models/unit');

// Middleware
const isAdmin = require('./../middleware/isAdmin');

var router = express.Router();

// only admins should be able to view all unit routes
router.all('*', isAdmin);

// GET new units form
router.get('/new', function(req, res) {
  Unit.find().then(units => res.render('units/new', { units })).catch(e => console.log(e));
});

// POST create a unit
router.post('/', (req, res) => {
  var unit = new Unit(req.body);
  unit.save().then(() => res.redirect('/units/new')).catch(e => console.log(e));
});

module.exports = router;
