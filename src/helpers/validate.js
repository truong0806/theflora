const { AuthFailureError, BadRequestError } = require("../core/error.response");

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
    case "discount":
      const invalid = [];
      if (new Date(fields.start_date) > new Date(fields.end_date)) {
        throw new BadRequestError("Date start is after date end");
      }
      for (const [key, value] of Object.entries(fields)) {
        if (!value || value === null) {
          if (key === "used_count" || key === "is_active") {
            continue;
          }
          invalid.push(`${key}`);
        } else {
          switch (key) {
            case "start_date":
              if (!value) throw new BadRequestError("Start date is invalid");
              if (new Date() > new Date(value)) {
                throw new BadRequestError("Date start is after current date");
              }
              break;
            case "end_date":
              if (!value) throw new BadRequestError("Start date is invalid");
              if (new Date() > new Date(value)) {
                throw new BadRequestError("Date end is before current date");
              }
              break;
            case "code":
              const regex = /^[A-Za-z0-9]+$/;
              if (!regex.test(value))
                throw new BadRequestError("Code only A-Z and 0-9 are allowed");
              if (value.length < 12 || value.length > 12) {
                throw new BadRequestError("Code must 12 characters");
              }
              break;
            case "shopId":
              if (!value) throw new BadRequestError("ShopId is invalid");
              break;
            case "min_order_value":
              if (!value)
                throw new BadRequestError("Min order value is invalid");
              if (value < 0)
                throw new BadRequestError(
                  "Min order value must be greater than 0"
                );
            case "product_ids":
              if (!value) throw new BadRequestError("Product ids is invalid");
              break;
            case "applies_to":
              if (!value) throw new BadRequestError("Applies to is invalid");
              break;
            case "name":
              const regularExpression = /^[A-Za-z0-9\u00C0-\u1EF9\s]+$/;
              if (!regularExpression.test(value))
                throw new BadRequestError("Name only A-Z and 0-9 are allowed");
              if (!value) throw new BadRequestError("Name is invalid");
              else if (value.length < 2) {
                throw new BadRequestError(
                  "Name must be greater than 2 characters"
                );
              }
              break;
            case "type":
              if (!value) throw new BadRequestError("Type is invalid");
              break;
            case "description":
              if (!value) throw new BadRequestError("Description is invalid");
              break;
            case "value":
              if (!value) throw new BadRequestError("Description is invalid");
              break;
            case "max_value":
              if (!value) throw new BadRequestError("Description is invalid");
              break;
            case "max_uses":
              if (!value) throw new BadRequestError("Max uses is invalid");
            case "max_uses_per_user":
              if (!value)
                throw new BadRequestError("Max uses per user is invalid");
              break;
          }
        }
      }
      if (invalid.length === 0) {
        return null;
      } else {
        throw new BadRequestError(`${invalid.join(", ")} is not a valid`);
      }
    default:
      return null;
  }
};

module.exports = validateFields;
