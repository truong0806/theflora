const { Client, GatewayIntentBits, Partials } = require('discord.js')
const bot = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
})

bot.login(
  'MTIyNDk2NDY0NTU1MTQ3Njc3Ng.GE1MFE.BdO7ZhRfBwvneMTGXQhDkfvmPWWeQPS7N1JOqg',
)

bot.on('messageCreate', async (message) => {
  if (message.author.bot) return
  if (
    message.channel.id === '1224965452111941703' &&
    message.content === 'ping'
  ) {
    await message.reply('pong')
  }
})
