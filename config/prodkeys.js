module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  COOKIE_SECRET: process.env.COOKIE_SECRET, // TODO: ideally this would be rotated by a key management service
  JWT_SECRET: process.env.JWT_SECRET, // TODO: Why do we need cookie secret? We should only be using the JWT scheme
};
