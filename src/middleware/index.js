const Logger = require('../loggers/discord.log.vl2')

const pushLogToDiscord = async (req, res, next) => {
  try {
    Logger.sendMessage(`${req.method} - ${req.originalUrl}`)
    return next()
  } catch (error) {
    console.log('🚀 ~ pushLogToDiscord ~ error:', error)
    return next(error)
  }
}
const logErrorToDiscord = async (err, req, res, next) => {
  // Log the error to Discord
  Logger.sendMessage(`Error: ${err.message}\nStack: ${err.stack}`)

  // Pass the error to the next middleware function
  next(err)
}

module.exports = { pushLogToDiscord, logErrorToDiscord }
