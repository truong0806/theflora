const accessRouter = require("./access");
const productRouter = require("./product");

const initRoutes = (app) => {
  app.use("/api/v1/shop", accessRouter);
  app.use("/api/v1/product", productRouter);
};

module.exports = initRoutes;
