module.exports = ({ /* events, CONFIG */log }) => ({
  // controller methods
  logFile(payload) {
    try {
      log.info(payload);
    } catch (error) {
      throw new Error(error);
    }
  },

});
