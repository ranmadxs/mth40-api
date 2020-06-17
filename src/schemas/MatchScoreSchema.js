var mongoose = require ("mongoose");
var playerScore = require("./PlayerScoreSchema");

const matchScoreSchema = new mongoose.Schema({
  tournamentId: { type: Number, required: true },
  matchId: { type: Number, required: true },
  status: { type: String, required: false },
  playersScore: [playerScore.schema],
});

matchScoreSchema.index({ tournamentId: 1, matchId: 1 }, { unique: true });

const model = mongoose.model('MatchScore', matchScoreSchema);

module.exports = {
  model,
  schema: matchScoreSchema
}