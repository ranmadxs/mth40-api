var mongoose = require ("mongoose");
var Faction = require("./FactionSchema");

var armySchema = new mongoose.Schema({
    name: { type: String, trim: true },
    code: { type: String, trim: true },
    factions: [Faction.schema],
    createdAt: {type: Date, default: Date.now}
  });

const model = mongoose.model('Army', armySchema);

module.exports = {
  model,
  schema: armySchema
}