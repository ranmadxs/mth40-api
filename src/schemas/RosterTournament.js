var mongoose = require ("mongoose");

var rosterTournamentSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    participantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rosterId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: {type: Date, default: Date.now},
});

rosterTournamentSchema.index({ tournamentId: 1, participantId: 1 }, { unique: true });

const model = mongoose.model('RosterTournament', rosterTournamentSchema);

module.exports = {
    model,
    schema: rosterTournamentSchema
}