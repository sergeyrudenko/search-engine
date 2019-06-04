const controller = require('./controller');

module.exports = ({ events, CONFIG }) => {
  //  create an controller instanse
  const indexerController = controller({ events, CONFIG });

  events.on('indexer.indexFiles', 
      indexerController.indexFiles.bind(indexerController));

  events.on('indexer.task', async function({ msg, content }) {
    try {
      if (!indexerController.hasOwnProperty(content.emit)) throw new Error('1');
      await indexerController[content.emit](content.args);
      
      events.emit('indexer.done', msg);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  events.emit('app.ready');

  return indexerController;
};
