const cron = require('node-cron')
const { deleteImagesInactive } = require('../services/upload.service')

// Schedule a task to run at midnight every day
cron.schedule('0 0 * * *', function () {
  console.log('Running a task every day at midnight')
  // Delete all images with the 'inactive' tag
  deleteImagesInactive()
})
