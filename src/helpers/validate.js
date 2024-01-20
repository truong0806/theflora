const { AuthFailureError } = require("../core/error.response");
const { asyncHandler } = require("./asyncHandler");

const validateFields = (model, fields) => {
  switch (model) {
    case "access":
      for (const [key, value] of Object.entries(fields)) {
        switch (key) {
          case "name":
            const regularExpression = /^[A-Za-z0-9À-ỹ\s]+$/;
            if (!value) throw new AuthFailureError("Name is invalid");
            else if (value.length > 50) {
              throw new AuthFailureError(
                "Name must be less than 50 characters"
              );
            } else if (!regularExpression.test(value)) {
              throw new AuthFailureError("Name not special character");
            }
            break;
          case "email":
            const regexEmail = /\S+@\S+\.\S+/;
            if (!regexEmail.test(value) || !value)
              throw new AuthFailureError("Email is invalid");
            break;
          case "password":
            const regexPass = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
            if (!value) throw new AuthFailureError("Password is invalid");
            else if (value.length < 6)
              throw new AuthFailureError(
                "Password must be at least 6 characters"
              );
            else if (!regexPass.test(value))
              throw new AuthFailureError(
                "Password must be have special character"
              );
            break;
          default:
            return null;
        }
      }
      break;
    case "product":
      for (const [key, value] of Object.entries(fields)) {
        switch (key) {
          case "product_name":
            const regularExpression = /^[A-Za-z0-9À-ỹ\s]+$/;
            if (!value) throw new AuthFailureError("Name is invalid");
            else if (value.length < 2) {
              throw new AuthFailureError(
                "Name must be greater than 2 characters"
              );
            } else if (!regularExpression.test(value)) {
              throw new AuthFailureError("Product Name not special character");
            }
            break;
          default:
            return null;
        }
      }
      break;
    default:
      return null;
  }
};

module.exports = {
  validateFields,
};
