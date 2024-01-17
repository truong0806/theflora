"use strict";

const StatusCode = {
  OK: 200,
  CREATE: 201,
};
const ReasonStatusCode = {
  OK: "Success",
  CREATE: "Created !",
};

class SuccessResponse {
  constructor(
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    data = {}
  ) {
    this.message = message ? message : reasonStatusCode;
    this.statusCode = statusCode;
    this.data = data;
  }
  send(res, headers = {}) {
    return res.status(this.statusCode).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, data }) {
    super(message, data);
  }
}
class Created extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.CREATE,
    reasonStatusCode = ReasonStatusCode.CREATE,
    data,
  }) {
    super(message, statusCode, reasonStatusCode, data);
  }
}

module.exports = {
  OK,
  Created,
};
