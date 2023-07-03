const { mongoose, newModel } = require('leemons-mongodb');

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    deploymentID: {
      type: String,
      required: true,
      index: true,
    },
    actionName: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ deploymentID: 1, actionName: 1 }, { unique: true });

const actionsModel = newModel(mongoose.connection, 'users_Actions', schema);

module.exports = { actionsModel };
