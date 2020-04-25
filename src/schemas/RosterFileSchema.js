var mongoose = require ("mongoose");

var rosterFileSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    rosterName: { type: String, trim: true },
    rosterId: { type: mongoose.Schema.ObjectId },
    binary:  Buffer
});

const model = mongoose.model('RosterFile', rosterFileSchema);

module.exports = {
    model,
    schema: rosterFileSchema
}