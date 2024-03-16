"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const routes = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { apiKey, permission, authentication, authenticationV2 } = require("../../auth/checkAuth");

routes.use(apiKey);
routes.get(
  "/productapply",
  asyncHandler(discountController.getAllDiscountCodeProduct)
);
routes.get("/shop/get-amount-discount", asyncHandler(discountController.getDiscount));
routes.get("/shop/apply", asyncHandler(discountController.apllyDiscountCode));
routes.get("/shop/cancel", asyncHandler(discountController.cancelDiscount));
routes.get(
  "/shop/discountcode",
  asyncHandler(discountController.getDiscountByCode)
);

routes.use(authentication);
routes.post(
  "/create",
  permission(process.env.PERMISSION_ADMIN),
  asyncHandler(discountController.create)
);
routes.delete(
  "/shop/delete",
  permission(process.env.PERMISSION_ADMIN),
  asyncHandler(discountController.delete)
);
routes.patch(
  "/update",
  permission(process.env.PERMISSION_ADMIN),
  asyncHandler(discountController.update)
);

// routes.use(authentication);

module.exports = routes;
