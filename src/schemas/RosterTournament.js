var mongoose = require ("mongoose");

var rosterTournamentSchema = new mongoose.Schema({
    bussinesKey: {type: String, required: false },
    tournament: { type: Object, required: true },
    participant: { type: Object, required: true },
    roster: { type: Object, required: true },
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},    
});


rosterTournamentSchema.pre(["save"], function (next) {
    this.bussinesKey = `tid=${this.tournament.id}_rosterId=${this.roster.id}`;
    next();
});

rosterTournamentSchema.index({ 'bussinesKey': 1 }, { unique: true });

const model = mongoose.model('RosterTournament', rosterTournamentSchema);

module.exports = {
    model,
    schema: rosterTournamentSchema
}