// Modules
var express = require("express"),
  _ = require("lodash");

// Models
var User = require("./../models/user"),
  Family = require("./../models/family");

var router = express.Router();

// GET Root (registration form)
router.get("/", (req, res) => {
  // Need families for registration form
  Family.find()
    .then(families => {
      res.render("index", { families, user: new User() });
    })
    .catch(e => console.log(e));
});

// GET login form
router.get("/login", (req, res) => res.render("sessions/login"));

// POST login form data
router.post("/login", (req, res) => {
  var user;

  console.log("req.body", req.body);
  User.findOne({ email: req.body.email })
    .then(userObj => {
      user = userObj;
      return user.authenticate(req.body.password);
    })
    .then(res => {
      if (!res) return Promise.reject("Username/Password Incorrect");
      return user.generateAuthorizationToken();
    })
    .then(() => {
      req.session["x-auth"] = user.tokens[user.tokens.length - 1].token;
      res.redirect(`/families/${user.family.name}`);
    })
    .catch(error => res.render("sessions/login", { error }));
});

// Register
router.post("/register", (req, res) => {
  const body = _.pick(req.body, [
    "name.first",
    "name.last",
    "name.nickname",
    "email",
    "family",
    "password"
  ]);

  const family = JSON.parse(req.body.family);
  const familyName = family.name;
  body.family = family.id;

  var user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthorizationToken();
    })
    .then(user => {
      req.session["x-auth"] = user.tokens[0].token;
      res.redirect(`/families/${familyName}`);
    })
    .catch(e => {
      if (body.family === "Please Select") {
        e.errors.family.message = "Please select a family";
      }
      Family.find()
        .then(families => {
          res.render("index", { families, errors: e.errors, user });
        })
        .catch(e => console.log(e.errors));
    });
});

// Logout (Remove JWT from user, then redirect to Home)
router.get("/logout", (req, res) => {
  res.locals.user.tokens.pull({ access: "auth", token: res.locals.token });
  res.locals.user
    .save()
    .then(user => {
      req.session.destroy(err => {
        if (err) console.log(err, "Session could not be destroyed");
        res.redirect("/");
      });
    })
    .catch(e => console.log(e));
});

router.get("/schedule", (req, res) => {
  Family.find()
    .then(families => {
      res.render("challenges/schedule", { families });
    })
    .catch(e => console.log(e));
});

// GET rules page
router.get("/rules", (req, res) => res.render("sessions/rules"));

module.exports = router;
