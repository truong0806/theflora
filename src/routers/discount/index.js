"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const routes = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { apiKey, permission, authentication } = require("../../auth/checkAuth");

routes.use(apiKey);
routes.use(permission(process.env.PERMISSION_USER));
routes.get(
  "/product",
  asyncHandler(discountController.getAllDiscountCodeProduct)
);
// routes.use(authentication);
routes.post("/create", asyncHandler(discountController.create));
routes.patch("/update", asyncHandler(discountController.update));

module.exports = routes;
