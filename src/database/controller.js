const fs = require('fs');
const util = require('util');

fs.readFileAsync = util.promisify(fs.readFile);

module.exports = ({ /* events, CONFIG */ }) => ({
  // controller methods
  // here tokens saves or updates
  async handle({ word, file, index }) {
    try {
      const dbWord = await this.read({ 
        model: this.model, 
        payload: { token: word },
      });
      const fileName = file.split('.')[0];
      const payload = { count: 1, places: [index] };
      if (!dbWord) {
        const indexes = {};
        indexes[fileName] = payload;
        return this.createRecord({ token: word, indexes } );
      }
      if (!dbWord.indexes[fileName]) dbWord.indexes[fileName] = payload;
      if (dbWord.indexes[fileName].places.indexOf(index) !== -1) return dbWord;
      dbWord.totalCount++;
      const indexes = dbWord.indexes;
      indexes[fileName].count++;
      indexes[fileName].places.push(index);
      dbWord.indexes = indexes;
      // non optimized moment
      return this.update({ 
        data: dbWord.updateData(), 
        payload: { token: word },
      
      }); 
    } catch (error) {
      throw new Error(error);
    }
  },

  createRecord(payload) {
    try {
      return this.create({ model: this.model, payload });
    } catch (error) {
      throw new Error(error);
    }
  },

  count({ model, payload = {} }) {
    const operation = model.count.bind(model);

    return operation(payload).then((count) => count.toString());
  },

  create({ model, payload = {} }) {
    return model.create.bind(model)(payload);
  },

  read({ model = this.model, payload = {} }) {
    return model.findOne.bind(model)(payload);
  },

  readAll({ model, payload = {} }) {
    return model.find.bind(model)(payload);
  },

  deleteOne({ model, payload = {} }) {
    return model.deleteOne.bind(model)(payload);
  },
  
  deleteMany({ model, payload = {} }) {
    return model.deleteMany.bind(model)(payload);
  },

  update({ model = this.model, data = {}, payload = {} }) {
    for (key in data) {
      if (data[key] === undefined) delete data[key];
    }
    return model.findOneAndUpdate.bind(model)(payload,
        { $set: data }, { new: true });
  },

});
