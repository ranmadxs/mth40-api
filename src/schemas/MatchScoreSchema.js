var mongoose = require ("mongoose");

const matchScoreSchema = new mongoose.Schema({
  tournamentId: { type: Number, required: true },
  matchId: { type: Number, required: true },
  status: { type: String, required: false },
  rosterTournaments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'RosterTournament',
    required: true,
  }],
  /* mvp: el unitId corresponde al id del unit del roster por que son los scores por la unidad de roster () */
  mvp: { type: String, required: false} ,
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date, default: Date.now},
});

matchScoreSchema.index({ tournamentId: 1, matchId: 1 }, { unique: true });

const model = mongoose.model('MatchScore', matchScoreSchema);

module.exports = {
  model,
  schema: matchScoreSchema
}