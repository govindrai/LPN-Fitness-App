var User = require('./../models/user');

function verifyAuthorization(req, res, next) {
  if (!req.session["x-auth"]) {
    next();
  } else {
    User.verifyAuthorizationToken(req.session["x-auth"])
    .then((user) => {
      if (!user) {
        throw Error("Invalid Username/Password");
      }
      res.locals.loggedIn = true;
      res.locals.user = user;
      next();
    })
    .catch((e) => console.log(e));
  }
}

module.exports = verifyAuthorization;