const controller = require('./controller');
// const { loggerUri } = require('./config.json');


module.exports = ({ events, CONFIG }) => {
  const log = require('simple-node-logger')
      .createSimpleFileLogger(`${CONFIG.logDir}/all.log`);
  log.setLevel('all');
  //  create an controller instanse
  const loggerController = controller({ events, CONFIG, log });

  events.on('logger.task', async function({ msg, content }) {
    try {
      if (!loggerController.hasOwnProperty(content.emit)) {
        throw new Error('data error');
      }

      await loggerController[content.emit](content.args);

      events.emit('logger.done', msg);
    } catch (error) {
      throw new Error(error);
    }
  });

  events.emit('app.ready');

  return loggerController;
};
