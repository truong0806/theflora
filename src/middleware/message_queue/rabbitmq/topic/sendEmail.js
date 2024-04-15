const amqp = require('amqplib')
const { argv } = require('node:process')

const sendEmail = async () => {
  try {
    const con = await amqp.connect(
      'amqps://dexuiorb:6OPH0YyphchDUYaA-zHyOp4tfR4V8hGW@octopus.rmq3.cloudamqp.com/dexuiorb',
    )
    const channel = await con.createChannel()

    //1 Create exchange
    const nameExchange = 'send_mail'
    await channel.assertExchange(nameExchange, 'topic', {
      durable: true,
    })
    const agrs = argv.slice(2)
    const msg = agrs[1] || 'Fixed'
    const topic = agrs[0]

    console.log(`Msg ${msg} send to topic::: ${topic}`)
    //2 publish exchange
    await channel.publish(nameExchange, topic, Buffer.from(msg))
    console.log('[x] send OK:::')
    setTimeout(() => {
      con.close()
      process.exit(0)
    }, 500)
  } catch (error) {
    console.log(error)
    throw error
  }
}

sendEmail().catch((error) => console.log(error))
