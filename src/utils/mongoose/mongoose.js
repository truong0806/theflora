const { Types } = require('mongoose')
const _ = require('lodash')

const ConvertToObjectId = (id) => {
  return new Types.ObjectId(id)
}
const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds)
}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 1]))
}
const unSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 0]))
}

module.exports = {
  ConvertToObjectId,
  getInfoData,
  getSelectData,
  unSelectData,
}
