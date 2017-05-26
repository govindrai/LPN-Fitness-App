var express = require('express');
var router = express.Router();
const {User} = require('./../models/user'); 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/profile', function(req, res, next) {
}); 


module.exports = router;
