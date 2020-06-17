var mongoose = require ("mongoose");

const offensiveSubschema = new Schema({
  _id: false,
  kill: { type: Number, default: 0 },
  wound: { type: Number, default: 0 },
  objetive: { type: Number, default: 0 },
});

const defensiveSubschema = new Schema({
  _id: false,
  kill: { type: Number, default: 0 },
  wound: { type: Number, default: 0 },
  objetive: { type: Number, default: 0 },
});

// TODO: crear alias en el roster->forces->unit
const unitScoreSchema = new mongoose.Schema({
  /* el unitId corresponde al id del unit del roster por que son los scores por la unidad de roster () */
  unitId: { type: String, required: true },
  matchScoreId: {type: mongoose.Schema.ObjectId},
  playerScoreId: {type: mongoose.Schema.ObjectId},
  defensive: defensiveSubschema,
  offensive: offensiveSubschema,
});

const model = mongoose.model('UnitScore', unitScoreSchema);

module.exports = {
  model,
  schema: unitScoreSchema
}