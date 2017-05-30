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

// Complete Registration
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
    return user.generateAuthorizationToken();
  })
  .then((auth_token) => {
    token = auth_token;
    user.tokens.push({access: "auth", token});
    return user.save();
  })
  .then(() => {
    return User.populate(user, 'family');
  })
  .then((new_user) => {
    user = new_user;
    req.session["x-auth"] = token;
    res.redirect('/families/' + user.family.name);
  })
  .catch(e => console.log(e));
})

router.get('/login', (req, res) => {
    res.render('sessions/new');
});


// Logout
router.get('/logout', (req, res) => {
  var token = req.session["x-auth"];
  User.destroyAuthorizationToken(token)
  .then((user) => {
    if (!user) {
      res.send("We don't know who you are and why you wanna logout")
    }
    user.tokens = _.remove(user.tokens, (tokenObj) => {
      tokenObj.access === "auth" && tokenObj.token === token
    });
    return user.save()
  })
  .then((user) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err, "Session could not be destroyed")
      }
      res.redirect('/');
    })
  })
  .catch((e) => console.log(e));
})


router.get('/profile', (req, res) => {
});


module.exports = router;
