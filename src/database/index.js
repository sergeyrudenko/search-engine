const controller = require('./controller');
const { schema, statics } = require('./schema');
const mongoose = require('mongoose');
const { databaseUri } = require('./config.json');

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
let model;


module.exports = ({ events, CONFIG }) => {
  //  create an controller instanse
  const databaseController = controller({ events, CONFIG });

  // connect database
  mongoose.connect(databaseUri, { useNewUrlParser: true },
      (err) => console.log((!err) ? 'App connect to ModgoDB' : err)
  );

  // create model
  events.on('database.model', ({ name = 'words' } = {}) => {
    if (!name) throw new Error('Empty mongoose schema name!');

    let essenseSchema = new mongoose.Schema(schema);

    if (statics) essenseSchema = statics(essenseSchema);

    model = mongoose.model(name, essenseSchema);
    
    databaseController.model = model;

    return Promise.resolve(model);
  });


  events.on('database.count', databaseController.count);
  
  events.on('database.handle', 
      databaseController.handle.bind(databaseController));

  events.on('database.create', databaseController.create);

  events.on('database.read', databaseController.read);

  events.on('database.readAll', databaseController.readAll);

  events.on('database.update', databaseController.update);

  events.on('database.delete.one', databaseController.deleteOne);

  events.on('database.delete.many', databaseController.deleteMany );

  events.on('database.create', databaseController.create);

  events.on('database.update', databaseController.update);

  events.on('database.task', async function({ msg, content }) {
    try {
      if (!databaseController.hasOwnProperty(content.emit)) {
        throw new Error('data error');
      }

      await databaseController[content.emit](content.args);

      events.emit('database.done', msg);
    } catch (error) {
      throw new Error(error);
    }
  });

  events.emit('app.ready');

  return databaseController;
};
