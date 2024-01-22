"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { apiKey, permission, authentication } = require("../../auth/checkAuth");
const routes = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");

routes.use(apiKey);
routes.get("", asyncHandler(productController.getAllProduct));
routes.get("/id/:product_id", asyncHandler(productController.getProductByIds));
routes.get("/:slug", asyncHandler(productController.getProductBySlug));
routes.get(
  "/search/:keySearch",
  asyncHandler(productController.searchProductByKeySearchs)
);

//User routes
routes.use(permission(process.env.PERMISSION_USER));
routes.use(authentication);

//Admin routes
// routes.use(permission(process.env.PERMISSION_ADMIN));
routes.post("/create", asyncHandler(productController.createProduct));
routes.put(
  "/changestatus",
  asyncHandler(productController.changeStatusProductByShop)
);
routes.get("/:status/all", asyncHandler(productController.getProductByStatus));

module.exports = routes;
