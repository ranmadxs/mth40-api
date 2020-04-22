var mongoose = require ("mongoose");

var costSchema = new mongoose.Schema({
    _id: false,
    pts: { type: Number },
    PL: { type: Number },
    CP: { type: Number }
  });

const model = mongoose.model('Cost', costSchema);

module.exports = {
  model,
  schema: costSchema
}