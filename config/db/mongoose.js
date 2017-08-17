const mongoose = require("mongoose"),
  { MONGO_URL } = require("../keys.js");

mongoose.Promise = global.Promise;
mongoose.set("debug", true);

mongoose.connect(MONGO_URL, { useMongoClient: true }, error => {
  if (error) console.log("There was an error: ", error);
  console.log("Successfully connected to LPN");
  console.log(mongoose.modelNames());
});

mongoose.connection.on("error", () => {
  console.log("Mongoose Collection Error!");
});

module.exports = mongoose;
