const amqp = require('amqplib');
const { modules } = require('./config.json');

const url = (process.env.DOCKER) ? 'amqp://rabbitmq' : 'amqp://localhost';

module.exports = async ({ events }) => {
  // creating connection
  try {
    const connection = await amqp.connect(url);
    console.log('Connected to RabbitMQ');
    const channel = await connection.createChannel();

    for (let i = 0; i < modules.length; i++) {
      // creating queues
      await channel.assertQueue(modules[i], { durable: true });
      if (!process.env.DOCKER) await channel.purgeQueue(modules[i]);

      // creating produsers
      events.on(`send.${modules[i]}`, async (task) => {
        await channel.sendToQueue(modules[i], 
            Buffer.from(JSON.stringify(task)), {
              contentType: 'application/json',
              persistent: true,
            });
      });

      channel.prefetch(1);
      // creating consumers
      channel.consume(modules[i], function(msg) {
        // emit method in module and get one more message
        events.emit(`${modules[i]}.task`, { 
          msg, content: JSON.parse(msg.content.toString()),
        });

        events.once(`${modules[i]}.done`, (message) => {
          channel.ack(message);
        });
      }, { noAck: false });
    }

    events.emit('app.ready');
  } catch (error) {
    throw new Error(error);
  }
};
