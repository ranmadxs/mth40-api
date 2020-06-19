var mongoose = require ("mongoose");

const offensiveSubschema = new mongoose.Schema({
  _id: false,
  kill: { type: Number, default: 0 },
  wound: { type: Number, default: 0 },
  objetive: { type: Number, default: 0 },
});

const defensiveSubschema = new mongoose.Schema({
  _id: false,
  kill: { type: Number, default: 0 },
  wound: { type: Number, default: 0 },
  objetive: { type: Number, default: 0 },
});

// TODO: crear alias en el roster->forces->unit
const unitScoreSchema = new mongoose.Schema({
  /* el unitId corresponde al id del unit del roster por que son los scores por la unidad de roster () */
  unitId: { type: String, required: true },
  matchScore: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'MatchScore' },
  rosterTournament: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'RosterTournament' },
  defensive: defensiveSubschema,
  offensive: offensiveSubschema,
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date, default: Date.now}  
});

unitScoreSchema.index({ unitId: 1, matchScore: 1 }, { unique: true });

const model = mongoose.model('UnitScore', unitScoreSchema);

module.exports = {
  model,
  schema: unitScoreSchema
}