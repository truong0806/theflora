const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");

//middleware
app.use(morgan("dev"));
// app.use(morgan("combined"))

app.use(helmet());
app.use(compression());
//database

//routes
app.get("/", (req, res, next) => {
  const str = "abc";
  return res.status(200).json({
    message: "Hello World and Hello from the server side!",
    data: str.repeat(10000),
  });
});
//error handling

module.exports = app;
