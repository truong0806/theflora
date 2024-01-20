"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const {
  apiKey,
  permission,
  authentication,
  authenticationV2,
} = require("../../auth/checkAuth");
const routes = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { createapikey } = require("../../services/apikey.service");

routes.use(apiKey);
routes.use(permission(process.env.PERMISSION_USER));
routes.post("/signin", asyncHandler(accessController.signIn));
routes.post("/signup", asyncHandler(accessController.signUp));

routes.use(authenticationV2);
routes.post(
  "/refreshtoken",
  asyncHandler(accessController.handlerRefeshTokenV2)
);
routes.post("/signout", asyncHandler(accessController.signOut));

routes.post(
  "/createapikey",
  permission(process.env.PERMISSION_ADMIN),
  (req, res) => {
    createapikey(req.body.permissions);
    res.send("oke");
  }
);

// routes.use(permission(process.env.PERMISSION_ADMIN));
// routes.post("/admin", accessController.signIn);

module.exports = routes;
