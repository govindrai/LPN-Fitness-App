// Models
const User = require("./../models/user");

// check if the user is logged in
module.exports = function verifyAuthorization(req, res, next) {
  if (req.path === "/login") return next();
  // if x-auth key doesn't exist in session object
  // render the 404 view (meaning they are not logged in)
  // else verify the JWT and find the user associated with the JWT
  if (!req.session["x-auth"]) {
    if (req.path == "/") return next();
    return res.render("sessions/unauthorized");
  }
  res.locals.token = req.session["x-auth"];
  User.decodeAuthorizationToken(res.locals.token)
    .then(user => {
      if (!user) return res.status(404).send("UNAUTHORIZED.");
      res.locals.user = user;
      return next();
    })
    .catch(e => console.log(e));
};
