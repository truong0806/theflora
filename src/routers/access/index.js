"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { apiKey, permission, authentication } = require("../../auth/checkAuth");
const routes = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { createapikey } = require("../../services/apikey.service");

routes.use(apiKey);
routes.use(permission(process.env.PERMISSION_USER));
routes.post("/shop/signin", asyncHandler(accessController.signIn));
routes.post("/shop/signup", asyncHandler(accessController.signUp));
routes.post(
  "/shop/refreshtoken",
  authentication,
  asyncHandler(accessController.handlerRefeshToken)
);
routes.post(
  "/shop/signout",
  authentication,
  asyncHandler(accessController.signOut)
);

routes.post(
  "/shop/createapikey",
  permission(process.env.PERMISSION_ADMIN),
  (req, res) => {
    createapikey(req.body.permissions);
    res.send("oke");
  }
);

// routes.use(permission(process.env.PERMISSION_ADMIN));
// routes.post("/shop/admin", accessController.signIn);

module.exports = routes;
