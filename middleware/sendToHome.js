// if a logged in user is trying to go to the home page, take them to their family page
module.exports = function sendToHome(req, res, next) {
  if (res.locals.user) {
    res.locals.home = "/families/" + res.locals.user.family.name;
    if (req.path === "/") return res.redirect(res.locals.home);
  }
  next();
};
