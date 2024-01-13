"use strict";
const mongoose = require("mongoose");
const os = require("node:os");
const process = require("process");
const _SECOND = 500;
const countConnect = () => {
  const numConnect = mongoose.connections.length;
  console.log(`Number of connection: ${numConnect}`);
};
const checkOverLoad = () => {
  setInterval(() => {
    const numConnect = mongoose.connections.length;
    const numCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maxConnection = numCore * 5;

    console.log(`Memory usage: ${memoryUsage/1024/1024} MB`);
    console.log(`Number of connection: ${numConnect}`);

    if (numConnect > maxConnection) {
      console.log("Overload connection");
      process.exit(1);
    }
  }, _SECOND);
};

module.exports = {
  countConnect,
  checkOverLoad
};
