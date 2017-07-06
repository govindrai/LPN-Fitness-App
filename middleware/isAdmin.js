module.exports = function isAdmin(req, res, next) {
  if (res.locals.user.admin) {
    next();
  } else {
    res.render('sessions/unauthorized', {message: "Only Admins have access to admin-settings! Sorry!"});
  }
}