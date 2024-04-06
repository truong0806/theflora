const { BadRequestError } = require('../core/error.response')
const { Created, OK } = require('../core/success.response')
const validateFields = require('../helpers/validate')
const {
  uploadImageFormURL,
  uploadImageFormLocal,
  uploadMutifile,
} = require('../services/upload.service')

class UploadController {
  upload = async (req, res) => {
    const { url } = req.body
    const filePath = req.file.path
    const userId = req.user.userId

    if (!filePath && !url) {
      throw new BadRequestError('Upload image failed')
    }
    const imageUrl = filePath
      ? await uploadImageFormLocal(filePath, userId)
      : await uploadImageFormURL(url, userId)

    new Created({ data: imageUrl }).send(res)
  }
  uploadMuti = async (req, res) => {
    const { url } = req.body
    const userId = req.user.userId
    const { files } = req

    if (!url && !files) {
      throw new BadRequestError('Upload image failed')
    }
    const imageUrl = files
      ? await uploadMutifile(files, userId)
      : await uploadImageFormURL(url, userId)

    new Created({ data: imageUrl }).send(res)
  }
}
module.exports = new UploadController()
