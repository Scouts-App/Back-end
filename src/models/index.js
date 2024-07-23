const mongoose = require("mongoose");
const UserSchema = require("./User.schema");
const WatchListSchema = require("./WatchList.schema");
const AlertTokenSchema = require("./AlertToken.schema");

module.exports = {
  User: mongoose.model("User", UserSchema),
  WatchList: mongoose.model("WatchList", WatchListSchema),
  AlertToken: mongoose.model("AlertToken", AlertTokenSchema),
};
