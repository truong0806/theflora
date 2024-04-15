const amqp = require('amqplib')
const { argv } = require('node:process')

const reciveEmail = async () => {
  try {
    const con = await amqp.connect(
      'amqps://dexuiorb:6OPH0YyphchDUYaA-zHyOp4tfR4V8hGW@octopus.rmq3.cloudamqp.com/dexuiorb',
    )
    const channel = await con.createChannel()
    const nameExchange = 'send_mail'
    //1 Create exchange
    await channel.assertExchange(nameExchange, 'topic', {
      durable: true,
    })
    const { queue } = await channel.assertQueue('', {
      exclusive: true,
    })
    //2 Binding exchange
    const agrs = argv.slice(2)
    if (!agrs.length) {
      process.exit(0)
    }

    console.log(`Waiting for :: ${queue} ::: ${agrs}`)
    agrs.forEach(async (key) => {
      await channel.bindQueue(queue, nameExchange, key)
    })

    //2 consumer exchange
    await channel.consume(
      queue,
      (msg) => {
        console.log(
          `Routing consumer exchange: ${
            msg.fields.routingKey
          } ::: msg ${msg.content.toString()}`,
        )
      },
      {
        noAck: true,
      },
    )
    // setTimeout(() => {
    //   con.close()
    //   process.exit(0)
    // }, 500)
  } catch (error) {
    console.log(error)
    throw error
  }
}

reciveEmail().catch((error) => console.log(error))
