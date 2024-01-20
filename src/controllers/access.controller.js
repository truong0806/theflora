"use strict";
const accessService = require("../services/access.service");
const { Created, Accepted } = require("../core/success.response");
const { AuthFailureError } = require("../core/error.response");
const { validateFields } = require("../helpers/validate");

class AccessController {
  signUp = async (req, res, next) => {
    validateFields("access", req.body);
    new Created({
      data: await accessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  signIn = async (req, res, next) => {
    validateFields("access", { email: req.body.email });
    if (!req.body.password) throw new AuthFailureError("Password is invalid");
    new Accepted({
      data: await accessService.signIn(req.body),
    }).send(res);
  };

  signOut = async (req, res, next) => {
    new Accepted({
      data: await accessService.signOut(req.user),
    }).send(res);
  };
  handlerRefeshTokenV2 = async (req, res, next) => {
    new Accepted({
      data: await accessService.handlerRefeshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();
