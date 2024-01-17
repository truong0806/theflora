"use strict";
const shopModel = require("../models/shop.model");
const accessService = require("../services/access.service");
const { Created } = require("../core/success.response");

class AccessController {
  signUp = async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new Error("Missing input");
    new Created({
      message: "Sign up success",
      data: await accessService.signUp({ name, email, password }),
    }).send(res);
  };
  
  signIn = async (req, res, next) => {
    const { email, password } = req.body;
    try {
      if (!email || !password)
        return res.status(400).json({ err: 1, msg: "Missing input" });
      return res
        .status(201)
        .json(await accessService.signIn({ email, password }));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
