const NOTI = require('../models/notification.model')
const constants = require('../utils/constains')

const pushNotiToSystem = async ({
  type = 'PRODUCT-001',
  receivedId = 1,
  senderId = 1,
  options = {},
}) => {
  let noti_content

  if (type === constants.noti.NOTI_TYPE_PRODUCT_CREATE_SUCCESS) {
    noti_content = constants.noti.NOTI_PRODUCT_CREATE_SUCCESS
  } else if (type === constants.noti.NOTI_TYPE_PROMOTION_SUCCESS) {
    noti_content = constants.noti.NOTI_PROMOTION_CREATE_SUCCESS
  }
  const newNoti = await NOTI.create({
    noti_type: type,
    noti_senderId: senderId,
    noti_receivedId: receivedId,
    noti_content,
    noti_options: options,
  })
  return newNoti
}
const listNotiByUser = async ({ userId = 1, type = 'All', isRead = 0 }) => {
  const match = { noti_receivedId: userId }
  if (type !== 'All') {
    match['noti_type'] = type
  }

  const listNoti = await NOTI.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        noti_type: 1,
        noti_senderId: 1,
        noti_receivedId: 1,
        noti_content: 1,
        createAt: 1,
      },
    },
  ])
  return listNoti
}

module.exports = {
  pushNotiToSystem,
  listNotiByUser,
}
