var mongoose = require ("mongoose");

var SubFaction = require("./SubFactionSchema");
var Unit = require("./UnitSchema");

var factionSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    code: { type: String, trim: true },
    url: { type: String, trim: true },
    subFactions: [SubFaction.schema],
    units: [Unit.schema],
});

const model = mongoose.model('Faction', factionSchema);

module.exports = {
    model,
    schema: factionSchema
}