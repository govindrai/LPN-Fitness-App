var express = require('express');
var router = express.Router();
const {User} = require('./../models/user');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

router.get('/signup', (req, res) => {

})

router.get('/profile', (req, res) => {
});


module.exports = router;
