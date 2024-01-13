'use strict';
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectString = process.env.MONGODB_URI;
mongoose
  .connect(connectString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

//dev
if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
