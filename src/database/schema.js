/* eslint-disable max-len */
module.exports = {
  schema: {
    token: {
      type: 'string',
      default: '',
    },
    indexes: {
      type: 'object',
      default: {},
    },
    totalCount: {
      type: 'number',
      default: 1,
    },
  },
  statics: (schema) => {
    schema.methods.updateData = function() {
      return {
        indexes: this.indexes,
        totalCount: this.totalCount,
      };
    };
    schema.methods.public = function() {
      return {
        findIn: this.indexes,
        totalFindCount: this.totalCount,
        word: this.token,
      };
    };
    schema.methods.saveThis = async function() {
      await this.save();
      return this;
    };
    return schema;
  },
};
