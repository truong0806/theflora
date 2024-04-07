const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app-123',
  brokers: ['localhost:9092'],
})
const runProducer = async () => {
  const producer = kafka.producer()

  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [{ value: 'Hello KafkaJS user 3211' }],
  })
}

runProducer().catch((e) => console.error(e))
