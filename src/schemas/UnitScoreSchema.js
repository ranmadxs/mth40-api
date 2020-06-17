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

const unitScoreSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.ObjectId },
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