const path = require('path');
const fs = require('fs');
const util = require('util');
fs.readFileAsync = util.promisify(fs.readFile);
fs.readdirAsync = util.promisify(fs.readdir);

module.exports = ({ events, CONFIG, redis }) => ({
  // controller methods
  async handleNewFiles(files) {
    try {
      events.emit('send.logger', { emit: 'logFile', args: { 
        message: 'new files found',
        files, 
      }});
      const indexedFiles = await redis.get('directory:indexed');
      if (indexedFiles) {
        const indexedArr = JSON.parse(indexedFiles);

        const newFiles = files.filter(function(file) {
          return indexedArr.indexOf(file) === -1;
        });

        events.emit('send.indexer', { emit: 'indexFiles', args: newFiles });
        redis.set('directory:indexed', JSON.stringify(newFiles));
      } else {
        events.emit('send.indexer', { emit: 'indexFiles', args: files });
        redis.set('directory:indexed', JSON.stringify(files));
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  async scanDirectory({ directory = CONFIG.directory } = {}) {
    try {
      events.emit('send.logger', { emit: 'logFile', args: { 
        message: 'Start scanning dirrectory', 
      }});

      const savedFiles = await redis.get('directory:files');
      const directoryPath = path.join(__dirname, directory);

      const files = await fs.readdirAsync(directoryPath);

      if (JSON.stringify(files) !== savedFiles) {
        this.handleNewFiles(files);
        redis.set('directory:files', JSON.stringify(files));
      }
      return files;
    } catch (error) {
      throw new Error(error);
    }
  },
});
