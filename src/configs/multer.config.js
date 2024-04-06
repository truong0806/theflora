const multer = require('multer')

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})
const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src/uploads')
    },
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(
          new Error('Only jpg, jpeg, png, and gif image types are allowed'),
        )
      }

      cb(null, true)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
})
module.exports = { uploadMemory, uploadDisk }
