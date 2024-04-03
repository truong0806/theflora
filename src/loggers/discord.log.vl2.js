'use strict'
const { Client, GatewayIntentBits } = require('discord.js')
require('dotenv').config()

const { DISCORD_CHANNEL_ID, DISCORD_TOKEN } = process.env
class LoggerService {
  constructor() {
    this.Client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
      ],
    })
    this.channelId = DISCORD_CHANNEL_ID
    this.Client.on('ready', () => {
      console.log(`Logged in as ${this.Client.user.tag}!`)
    })
    this.Client.login(DISCORD_TOKEN)
  }
  sendMessage(message = 'message') {
    const channel = this.Client.channels.cache.get(this.channelId)
    if (!channel) {
      console.error('Channel not found', this.channelId)
      return
    }
    channel.send(message).catch((e) => console.error(e))
  }
}
module.exports = new LoggerService()
