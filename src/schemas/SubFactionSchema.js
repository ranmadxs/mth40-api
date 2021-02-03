var mongoose = require ("mongoose");

const subFactionSchema = new mongoose.Schema({
  _id: false,
  name: { type: String }
});

const model = mongoose.model('SubFaction', subFactionSchema);

module.exports = {
    model,
    schema: subFactionSchema
  }