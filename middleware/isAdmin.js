module.exports = function isAdmin(req, res, next) {
  if (res.locals.user.admin) {
    next();
  } else {
    res.render('sessions/unauthorized', { message: 'Only admins have access to this feature! Sorry!' });
  }
};
