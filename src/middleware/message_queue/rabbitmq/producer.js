const amqplib = require('amqplib')

const runProducer = async () => {
  try {
    const queue = 'tasks'
    const conn = await amqplib.connect('amqps://guest:truong911@localhost')
    const ch2 = await conn.createChannel()
    ch2.assertQueue(queue, { durable: true })
    ch2.sendToQueue(queue, Buffer.from('something to do 2'))
  } catch (error) {
    console.log(error)
  }
}
runProducer().catch((err) => console.error(err))
