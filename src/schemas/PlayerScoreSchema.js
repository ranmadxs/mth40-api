var mongoose = require ("mongoose");

const playerScoreSchema = new mongoose.Schema({
  rosterTournament: {
    type: mongoose.Schema.ObjectId,
    ref: 'RosterTournament',
    required: true,
  },
  unitsScore: [{
    type: mongoose.Schema.ObjectId,
    ref: 'UnitScore',
  }],

});

const model = mongoose.model('PlayerScore', playerScoreSchema);

module.exports = {
  model,
  schema: playerScoreSchema
}