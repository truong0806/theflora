const cloudinary = require('../configs/cloudinary.config')

const uploadImageFormURL = async (url, userId) => {
  try {
    const folderName = `theflora/${userId}`
    const newFileName = new Date().getTime()
    const result = await cloudinary.v2.uploader.upload(url, {
      folder: folderName,
      resource_type: 'image',
      public_id: newFileName,
      tags: ['inactive'],
    })
    const { secure_url } = result
    return secure_url
  } catch (error) {
    console.log(error)
  }
}
const uploadImageFormLocal = async (path, userId) => {
  try {
    const folderName = `theflora/${userId}`
    const newFileName = new Date().getTime()
    const result = await cloudinary.v2.uploader.upload(path, {
      folder: folderName,
      resource_type: 'image',
      public_id: newFileName,
      tags: ['inactive'],
    })
    const { secure_url } = result
    return {
      imageUrl: secure_url,
      ShopId: userId,
      thumb_url: cloudinary.v2.url(result.public_id, {
        width: 100,
        height: 100,
        format: 'jpg',
        secure: true,
      }),
    }
  } catch (error) {
    console.log(error)
  }
}
const uploadMutifile = async (files, userId) => {
  try {
    const uploadUrl = []
    const folderName = `theflora/${userId}`
    const newFileName = new Date().getTime()
    for (const file of files) {
      const result = await cloudinary.v2.uploader.upload(file.path, {
        folder: folderName,
        resource_type: 'image',
        public_id: `${newFileName}-${file.originalname}`,
        tags: ['inactive'],
      })
      const { secure_url } = result
      uploadUrl.push({
        imageUrl: secure_url,
        ShopId: userId,
        thumb_url: cloudinary.v2.url(result.public_id, {
          width: 100,
          height: 100,
          format: 'jpg',
          secure: true,
        }),
      })
    }
    return uploadUrl
  } catch (error) {
    console.log(error)
  }
}
const deleteImagesInactive = async () => {
  try {
    cloudinary.api.delete_resources_by_tag(
      'inactive',
      function (error, result) {
        console.log(result, error)
      },
    )
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  uploadImageFormURL,
  uploadImageFormLocal,
  uploadMutifile,
  deleteImagesInactive,
}
