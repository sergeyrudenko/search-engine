const jwt = require('jsonwebtoken');
module.exports = ({ /* events, */ CONFIG }) => ({
  createToken: function(payload) {
    return jwt.sign(payload, CONFIG.secretkey);
  },

  verifyToken: function({ token }) {
    try {
      const decoded = jwt.verify(token, CONFIG.secretkey);
      return decoded;
    } catch (err) {
      throw new Error('wrong token');
    } 
  },
});
