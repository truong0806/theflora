"use strict";
const accessService = require("../services/access.service");
const { Created, Accepted } = require("../core/success.response");
const { AuthFailureError } = require("../core/error.response");
const checkIsEmail = require("../helpers/check.isEmail");

class AccessController {
  signUp = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || !checkIsEmail(email))
      throw new AuthFailureError("Check your email or password");
    if (password.length < 6)
      throw new AuthFailureError("Password must be at least 6 characters");
    new Created({
      data: await accessService.signUp({ name, email, password }),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  signIn = async (req, res, next) => {
    const { email, password } = req.body;
    const userIp =
      req.socket.remoteAddress.replace("::ffff:", "") ||
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "";
    if (!email || !password || !checkIsEmail(email))
      throw new AuthFailureError("Check your email or password");
    if (password.length < 6)
      throw new AuthFailureError("Password must be at least 6 characters");
    new Accepted({
      data: await accessService.signIn({ email, password, userIp }),
    }).send(res);
  };
}

module.exports = new AccessController();
