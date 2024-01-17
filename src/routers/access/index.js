"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { apiKey, permission, asyncHandler } = require("../../auth/checkAuth");
const routes = express.Router();

// routes.use(apiKey);
// routes.use(permission(process.env.PERMISSION_USER));

routes.post("/shop/signin", asyncHandler(accessController.signIn));
routes.post("/shop/signup", asyncHandler(accessController.signUp));

// routes.use(permission(process.env.PERMISSION_ADMIN));
// routes.post("/shop/admin", accessController.signIn);

module.exports = routes;
