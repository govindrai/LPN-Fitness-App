var express = require('express'),
  _ = require('lodash');

var {User} = require('./../models/user'),
  {Family} = require('./../models/family');

var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  Family.find().then((families)=> {
    res.render('index', {families});
  })
});

router.post('/register', (req, res) => {
  var body = _.pick(req.body, [
    'name.first',
    'name.last',
    'name.nickname',
    'email',
    'family',
    'password'
  ]);

  var user = new User(body);
  var token;

  user.save().then(() => {
    return user.generateAuthToken()
  })
  .then((token) => {
    token = token;
    user.tokens.push({access: "auth", token});
    return user.save();
  })
  .then(() => {
    console.log(user);
    console.log("AFTER USER BEFORE POPULATE")
    return User.populate(user, 'family');
  })
  .then((new_user) => {
    user = new_user;
    console.log(user);
    req.session["id"] = user._id;
    req.session["x-auth"] = token
    res.cookie('x-auth', token);
    res.redirect('/families/' + user.family.name);
  })
  .catch(e => console.log(e));
})


router.get('/profile', (req, res) => {
});


module.exports = router;
