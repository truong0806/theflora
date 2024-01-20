"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { apiKey, permission, authentication } = require("../../auth/checkAuth");
const routes = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");

routes.get("/all", asyncHandler(productController.getAllProduct));
routes.use(apiKey);
routes.use(permission(process.env.PERMISSION_USER));
routes.use(authentication);
routes.get(
  "/drafts/all",
  asyncHandler(productController.getProductDraftByShop)
);
routes.post("/create", asyncHandler(productController.createProduct));

module.exports = routes;
