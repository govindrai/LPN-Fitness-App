// if a logged in user is trying to go to the home page, take them to their family page
module.exports = function sendToHome(req, res, next) {
  if (!res.locals.user) {
    return;
  }
  res.locals.home = `/families/${res.locals.user.family.name}`;
  if (req.path === '/') {
    res.redirect(res.locals.home);
  }
};
