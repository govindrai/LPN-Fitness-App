var express = require('express'),
  _ = require('lodash');

var User = require('./../models/user'),
  Family = require('./../models/family');

var router = express.Router();

// Landing & Registration Page
router.get('/', (req, res) => {
  Family.find().then((families)=> {
    res.render('index', {families});
  })
});

module.exports = router;
