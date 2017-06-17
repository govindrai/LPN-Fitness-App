// Modules
var express = require('express'),
  _ = require('lodash');

// Models
var User = require('./../models/user'),
  Family = require('./../models/family');

var router = express.Router();

// GET to Root (registration form or homepage depending on authorization)
router.get('/', (req, res) => {
  if (!res.locals.loggedIn) {
    // Need families for registration form
    Family.find()
    .then(families => {
      res.render('index', {families, user: new User({})});
    })
    .catch(e => console.log(e));
  } else {
    User.populate(res.locals.user, 'family')
    .then(user => {
      res.redirect(`families/${user.family.name}`);
    })
    .catch(e => {
      console.log(e);
    });
  }
});

// GET login form
router.get('/login', (req, res) => {
    res.render('sessions/login');
});

// POST login form data
router.post('/login', (req, res) => {
  var body = _.pick(req.body, [
    'email',
    'password'
  ]);

  var user;
  User.findOne({email: body.email})
  .then(foundUser => {
    user = foundUser;
    return user.authenticate(body.password);
  })
  .then(res => {
    if (!res) {
      return Promise.reject("Username/Password Incorrect");
    }
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

// Logout
router.get('/logout', (req, res) => {
  var token = req.session["x-auth"];
  User.destroyAuthorizationToken(token)
  .then(user => {
    if (!user) res.send("We don't know who you are and why you wanna logout");
    console.log(user);
    user.tokens = _.remove(user.tokens, tokenObj => {
      return tokenObj.access === "auth" && tokenObj.token === token;
    });
    return user.save();
  })
  .then((user) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err, "Session could not be destroyed");
      }
      res.redirect('/');
    });
  })
  .catch((e) => console.log(e));
});

router.get('/rules', (req, res) => {
  res.render('sessions/rules');
});


router.get('/profile', (req, res) => {
});


module.exports = router;
