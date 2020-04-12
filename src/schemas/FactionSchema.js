var mongoose = require ("mongoose");

var factionSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    url: { type: String, trim: true }
  });

const model = mongoose.model('Faction', factionSchema);

module.exports = {
    model,
    schema: factionSchema
  }