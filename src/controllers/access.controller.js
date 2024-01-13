const { nextTick } = require("process");

class AccessController {
  signUp = async (req, res, next) => {
    try {
      console.log("[POST]", req.body);
      return res.status(200).json({
        code: "2001",
        message: "Sign up successfully",
        metadate: {
          userId: 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
