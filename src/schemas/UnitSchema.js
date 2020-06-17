var mongoose = require ("mongoose");

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  alias: { type: String, required: false },
  type: { type: String, required: false },
  mainCategory: { type: String, required: false },
});

const model = mongoose.model('Unit', unitSchema);

module.exports = {
  model,
  schema: unitSchema
}