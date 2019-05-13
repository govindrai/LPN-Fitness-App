module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  REDIS_URL: process.env.REDIS_URL,
  COOKIE_SECRET: process.env.COOKIE_SECRET, // TODO: ideally this would be rotated by a key management service
};
