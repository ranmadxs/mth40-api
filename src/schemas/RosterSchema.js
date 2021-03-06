var mongoose = require ("mongoose");
var CostSchema = require("./CostSchema");

var rosterSchema = new mongoose.Schema({
    result: { type: Boolean },
    name: { type: String, trim: true },
    status: { type: String, trim: true },
    forces: [],
    name: { type: String, trim: true },
    costs: CostSchema.schema ,
    gameSystemName: { type: String, trim: true },
    gameSystemRevision: { type: String, trim: true },
    tournaments: { type: Object },
    mainFaction: { type: String, trim: true },
    conferenceName: { type: String, trim: true },
    teamOwner: { type: String, trim: true },
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now}
});

rosterSchema.index({ name: 1 }, { unique: true });

const model = mongoose.model('Roster', rosterSchema);

module.exports = {
    model,
    schema: rosterSchema
}