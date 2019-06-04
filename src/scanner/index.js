const controller = require('./controller');

module.exports = ({ events, CONFIG, redis }) => {
  //  create an controller instanse
  const scannerController = controller({ events, CONFIG, redis });

  events.on('scanner.scanDirectory', 
      scannerController.scanDirectory.bind(scannerController));

  events.on('scanner.task', async function({ msg, content }) {
    try {
      if (!scannerController.hasOwnProperty(content.emit)) throw new Error('1');
      await scannerController[content.emit](content.args);
      
      events.emit('scanner.done', msg);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  events.emit('app.ready');
  // auto re-scanning directory in 5min
  setInterval(scannerController.scanDirectory.bind(scannerController), 300000);
  return scannerController;
};
