/* eslint-disable new-cap */
const controller = require('./controller');
const express = require('express');
const router = express.Router();

module.exports = ({ events, CONFIG, db }) => {
  //  create an controller instanse
  const searchController = controller({ events, CONFIG });

  router.use(async (req, res, next) => {
    try {
      if (!req.headers.authorization) {
        const token = await searchController.createToken({ 
          user: 'guest', date: Date.now(),
        });
        return res.status(401).send(token);
      }

      const token = req.headers.authorization.split(' ')[1];
      const result = await searchController.verifyToken({ token });

      events.emit('send.logger', { emit: 'logFile', args: { 
        message: 'user authorized', 
        decodeResult: result,
      }});

      next();
    } catch (error) {
      return res.status(401).send('wrong token');
    }
  });

  router.get('/search', async function(req, res) {
    if (req.query.text == '') return res.send('Input some text.');
    const record = await db.read({ payload: { token: req.query.text } });
    
    return (record)? res.send(record.public()) : res.send('Nothing found');
  });

  events.on('search.task', async function({ msg, content }) {
    try {
      if (!searchController.hasOwnProperty(content.emit)) {
        throw new Error('data error');
      }

      await searchController[content.emit](content.args);

      events.emit('search.done', msg);
    } catch (error) {
      throw new Error(error);
    }
  });

  events.emit('app.ready');

  return router;
};
