var mongoose = require ("mongoose");

var tournamentMatchSchema = new mongoose.Schema({
    bussinesKey: {type: String, required: false },
    tournament: { type: Object, required: true },
    rosterTournaments: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'RosterTournament' }],
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
});

tournamentMatchSchema.pre(["save"], function (next) {
    this.bussinesKey = `tid=${this.tournament.id}_rosterId=${this.rosterTournaments.id}`;
    next();
});

tournamentMatchSchema.index({ 'bussinesKey': 1 }, { unique: true });

const model = mongoose.model('TournamentMatch', tournamentMatchSchema);

module.exports = {
    model,
    schema: tournamentMatchSchema
}
