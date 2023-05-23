const { mongoose, newModel } = require("leemons-mongodb");

const localesSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    name: {
      type: String,
    },
  },
  { timestamps: true }
);

let localesModel = newModel(
  mongoose.connection,
  "multilanguage_Locales",
  localesSchema
);

module.exports = { localesModel };
