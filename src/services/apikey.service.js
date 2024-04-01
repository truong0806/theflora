const apiKeyModel = require('../models/apikey.model')
const crypto = require('crypto')
const _ = require('lodash')

const findById = async (key) => {
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean()
  return objKey
}
const createapikey = async (permissions) => {
  const newOj = await apiKeyModel.create({
    key: crypto.randomBytes(16).toString('hex'),
    permissions: permissions,
  })
  return newOj
}
const deleteapikey = async (_id) => {
  const objKey = await apiKeyModel.findByIdAndDelete({
    _id
  })
  return objKey
}

module.exports = {
  findById,
  createapikey,
  deleteapikey,
}
