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
      res.render("users/new", {
        families,
        user: new User(),
        title: "Register"
      });
    })
    .catch(e => console.log(e));
});

// Redirect to Index
router.get("/login", (req, res) => res.redirect("/"));

// GET login form
router.get("/", (req, res) =>
  res.render("sessions/new", { loggedOut: req.query.loggedOut, title: "Login" })
);

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
      return res.redirect("/");
    })
    .catch(e => {
      if (e.name === "AuthError") {
        return res.render("sessions/new", {
          error: e.message,
          email,
          title: "Login"
        });
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

  var user = new User(body);
  user
    .save()
    .then(() => {
      return user.generateAuthorizationToken();
    })
    .then(() => {
      req.session["x-auth"] = user.tokens[0].token;
      res.redirect("/");
    })
    .catch(e => {
      console.log(e);
      const errors = e.errors;
      if (errors.family && errors.family.name === "CastError") {
        errors.family.message =
          "Please select your family from the list above.";
      }
      Family.find()
        .ne("name", "Bye")
        .then(families => {
          return res.render("users/new", {
            families,
            user,
            errors: e.errors,
            title: "Register"
          });
        })
        .catch(e => console.log(e));
      // Easy way to test errors output using postman
      // return res.json(e.errors);
    });
});

// Logout (Remove JWT from user, then redirect to Home)
router.get("/logout", (req, res) => {
  res.locals.user.tokens.pull({ access: "auth", token: res.locals.token });
  res.locals.user
    .update({ $set: { tokens: res.locals.user.tokens } })
    .then(() => {
      req.session.destroy(err => {
        if (err) console.log(err, "Session could not be destroyed");
        res.redirect("/?loggedOut=true");
      });
    })
    .catch(e => console.log(e));
});

router.get("/schedule", (req, res) => {
  return res.render("challenges/schedule", {
    standings: res.locals.currentChallenge.getStandings(),
    title: "Standings & Schedule"
  });
});

// GET rules page
router.get("/rules", (req, res) => {
  User.find({ admin: true })
    .then(admins =>
      res.render("sessions/rules", { admins, title: "Rubric & Rules" })
    )
    .catch(e => console.log(e));
});

module.exports = router;

// PRIVATE FUNCTIONS

function AuthError(message) {
  this.name = "AuthError";
  this.message = message || "Incorrect Username/Password.";
  this.stack = new Error().stack;
}
AuthError.prototype = Object.create(Error.prototype);
AuthError.prototype.constructor = AuthError;
