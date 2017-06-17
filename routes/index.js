// Modules
var express = require('express'),
  _ = require('lodash');

// Models
var User = require('./../models/user'),
  Family = require('./../models/family');

var router = express.Router();

// GET Root (registration form)
router.get('/', (req, res) => {
  // Need families for registration form
  Family.find()
  .then(families => {
    res.render('index', {families, user: new User()});
  })
  .catch(e => console.log(e));
});

// GET login form
router.get('/login', (req, res) => {
    res.render('sessions/login');
});

// POST login form data
router.post('/login', (req, res) => {
  var user;

  User.findOne({email: req.body.email})
  .then(userObj => {
    user = userObj;
    return user.authenticate(req.body.password);
  })
  .then(res => {
    if (!res) return Promise.reject("Username/Password Incorrect");
    return user.generateAuthorizationToken();
  })
  .then((authToken) => {
    token = authToken;
    user.tokens.push({access: "auth", token});
    return user.save();
  })
  .then(() => {
    return User.populate(user, 'family');
  })
  .then((newUser) => {
    user = newUser;
    req.session["x-auth"] = token;
    res.redirect('/families/' + user.family.name);
  })
  .catch(e => {
    res.render('sessions/login', {error: e});
  });
});

// Register
router.post('/register', (req, res) => {
  var body = _.pick(req.body, [
    'name.first',
    'name.last',
    'name.nickname',
    'email',
    'family',
    'password'
  ]);

  var user = new User(body),
    token;

  user.save()
  .then(() => {
    return user.generateAuthorizationToken();
  })
  .then((authToken) => {
    token = authToken;
    user.tokens.push({access: "auth", token});
    return user.save();
  })
  .then(() => {
    return User.populate(user, 'family');
  })
  .then((newUser) => {
    user = newUser;
    req.session["x-auth"] = token;
    res.redirect('/families/' + user.family.name);
  })
  .catch(e => {
    if (body.family === 'Please Select') {
      e.errors.family.message = "Please select a family";
    }
    Family.find()
    .then(families => {
      res.render('index', {families, errors: e.errors, user});
    })
    .catch(e => console.log(e.errors));
  });
});

// Logout (Remove JWT from user, then redirect to Home)
router.get('/logout', (req, res) => {
  res.locals.user.tokens = _.remove(res.locals.user.tokens, tokenObj => {
    return tokenObj.access === "auth" && tokenObj.token === res.locals.token;
  });
  res.locals.user.save()
  .then(() => {
    req.session.destroy(err => {
      if (err) console.log(err, "Session could not be destroyed");
      res.redirect('/');
    });
  })
  .catch((e) => console.log(e));
});

// GET rules page
router.get('/rules', (req, res) => res.render('sessions/rules'));

module.exports = router;
