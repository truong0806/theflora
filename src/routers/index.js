const accessRouter = require("./access");

const initRoutes = (app) => {
  app.use("/api/v1", accessRouter);
};

module.exports = initRoutes;
