var mongoose = require ("mongoose");

var rosterTournamentSchema = new mongoose.Schema({
    tournament: { type: Object, required: true },
    participant: { type: Object, required: true },
    roster: { type: Object, required: true },
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},    
});

//rosterTournamentSchema.index({ tournamentId: 1, participantId: 1 }, { unique: true });
rosterTournamentSchema.index({ 'tournament.id': 1, 'participant.id': 1 }, { unique: true });

const model = mongoose.model('RosterTournament', rosterTournamentSchema);

module.exports = {
    model,
    schema: rosterTournamentSchema
}