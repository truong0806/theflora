"use strict";
const accessService = require("../services/access.service");
const { Created, Accepted } = require("../core/success.response");
const { AuthFailureError } = require("../core/error.response");
const { validateFields } = require("../helpers/validate");

class AccessController {
  signUp = async (req, res, next) => {
    validateFields(req.body);
    new Created({
      data: await accessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  signIn = async (req, res, next) => {
    validateFields({ email: req.body.email });
    if (!req.body.password) throw new AuthFailureError("Password is invalid");
    new Accepted({
      data: await accessService.signIn(req.body),
    }).send(res);
  };

  signOut = async (req, res, next) => {
    new Accepted({
      data: await accessService.signOut(req.keyStore),
    }).send(res);
  };
  handlerRefeshToken = async (req, res, next) => {
    new Accepted({
      data: await accessService.handlerRefeshToken(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
