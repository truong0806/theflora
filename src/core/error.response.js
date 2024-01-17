"use strict";

const StatusCode = {
  CONFLICT: 409,
  FORBIDDEN: 403,
};
const ReasonStatusCode = {
  CONFLICT: "Conflict Error",
  FORBIDDEN: "Bad Request Error",
};

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ConlictRequestError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.CONFLICT,
    statusCode = StatusCode.CONFLICT
  ) {
    super(message, statusCode);
  }
}
class ForbiddenError extends ErrorResponse {
  constructor(
    message = ReasonStatusCode.FORBIDDEN,
    statusCode = StatusCode.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConlictRequestError,
  ForbiddenError,
};
