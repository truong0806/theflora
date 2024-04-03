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

module.exports = { pushLogToDiscord }
