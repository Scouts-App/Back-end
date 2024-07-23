require("dotenv").config();
const mongoose = require("mongoose");

const {
  MONGODB_URL: URL,
  MONGODB_AUTHSOURCE: AUTHSOURCE,
} = process.env;

const CONNECTION_URL = `mongodb://${URL}?authSource=${AUTHSOURCE}`;

const connectDB = async () => {
  return mongoose.connect(CONNECTION_URL);
};

module.exports = connectDB;
