// Modules
var express = require("express"),
  _ = require("lodash");

// Models
var User = require("./../models/user"),
  Family = require("./../models/family");

var router = express.Router();

// GET Root (registration form)
router.get("/register", (req, res) => {
  // Need families for registration form (not equal to by (ne));
  Family.find()
    .ne("name", "Bye")
    .then(families => {
      res.render("users/new", { families, user: new User() });
    })
    .catch(e => console.log(e));
});

// GET login form
router.get("/", (req, res) => res.render("sessions/login"));

// POST login form data
router.post("/login", (req, res) => {
  let user;
  const { email } = req.body;

  User.findOne({ email })
    .then(userObj => {
      if (!userObj) throw new AuthError();
      user = userObj;
      return user.authenticate(req.body.password);
    })
    .then(isAuthenticated => {
      if (!isAuthenticated) throw new AuthError();
      return user.generateAuthorizationToken();
    })
    .then(() => {
      req.session["x-auth"] = user.tokens[user.tokens.length - 1].token;
      res.redirect("/");
    })
    .catch(e => {
      if (e.name === "AuthError") {
        return res.render("sessions/login", { error: e.message, email });
      }
      return console.log(e);
    });
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

// PRIVATE FUNCTIONS

function AuthError(message) {
  this.name = "AuthError";
  this.message = message || "Incorrect Username/Password.";
  this.stack = new Error().stack;
}
AuthError.prototype = Object.create(Error.prototype);
AuthError.prototype.constructor = AuthError;
