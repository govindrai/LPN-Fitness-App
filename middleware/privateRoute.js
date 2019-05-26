// TODO: redirect to url the user was originally trying to access when hitting this auth wall

module.exports = function privateRoute(req, res, next) {
  if (res.locals.isAuthenticated) {
    return next();
  }
  return res.status(401).render('sessions/new', { error: 'You must be signed in to access this page' });
};
