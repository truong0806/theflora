const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

//midelware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
const { checkOverLoad } = require("./helpers/check.connect");
const initRoutes = require("./routers");
checkOverLoad();
//database
require("./dbs/init.mongoosedb").default;

//routes
initRoutes(app);
//error handler

module.exports = app;
