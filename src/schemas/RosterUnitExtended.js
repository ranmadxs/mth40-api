var mongoose = require ("mongoose");

var rosterUnitExtendedSchema = new mongoose.Schema({
    /* el unitId corresponde al id del unit del roster por que son los scores por la unidad de roster () */
    unitId: { type: String, required: true },
    alias: { type: String, required: false },
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
  });

const model = mongoose.model('RosterUnitExtended', rosterUnitExtendedSchema);

module.exports = {
  model,
  schema: rosterUnitExtendedSchema
}