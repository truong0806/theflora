const { OK } = require('../core/success.response')
const validateFields = require('../helpers/validate')
const { listNotiByUser } = require('../services/notification.service')

class NotiController {
  listNotiByUser = async (req, res) => {
    const data = await listNotiByUser(req.query)
    new OK({ data }).send(res)
  }
}
module.exports = new NotiController()
