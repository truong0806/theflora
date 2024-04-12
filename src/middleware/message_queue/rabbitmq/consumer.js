const amqplib = require('amqplib')
const queue = 'tasks'

const runConsumer = async () => {
  try {
    const queue = 'tasks'
    const conn = await amqplib.connect('amqps://guest:truong911@localhost')

    const ch1 = await conn.createChannel()
    await ch1.assertQueue(queue)

    // Listener
    ch1.assertQueue(queue, { durable: true })
    ch1.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          console.log('Received:', msg.content.toString())
          ch1.ack(msg)
        } else {
          console.log('Consumer cancelled by server')
        }
      },
      { noAck: false },
    )
  } catch (error) {
    console.log(error)
  }
}
runConsumer().catch((err) => console.error(err))
