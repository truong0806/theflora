const accessRouter = require("./access");
const productRouter = require("./product");
const discountRouter = require("./discount");

const initRoutes = (app) => {
  app.use("/api/v1/discount", discountRouter);
  app.use("/api/v1/product", productRouter);
  app.use("/api/v1/shop", accessRouter);
};

module.exports = initRoutes;
