const path = require('path');
const fs = require('fs');
const util = require('util');
fs.readFileAsync = util.promisify(fs.readFile);

module.exports = ({ events, CONFIG }) => ({
  // controller methods
  async indexFiles(files) {
    try {
      for (let i = 0; i < files.length; i++) {
        const file = await fs.readFileAsync(path.join(__dirname, 
            `${CONFIG.directory}/${files[i]}`), 'utf-8');
        this.indexFile(file, files[i]);
      } // TODO: set indexes files here
    } catch (error) {
      throw new Error(error);
    }
  },

  indexFile(file, filename) {
    try {
      events.emit('send.logger', { emit: 'logFile', args: { 
        message: 'Start indexing file', 
        filename,
      }});
      // separate by tokens
      const separated = file.split(' ');

      for (let i = 0; i < separated.length; i++) {
        events.emit('send.database', { 
          emit: 'handle', 
          args: { file: filename, index: i, word: separated[i] },
        });
        setTimeout(()=>{}, 0);
      }
    } catch (error) {
      throw new Error(error);
    }
  },
});
