var mongoose = require ("mongoose");
var RosterSchema = require("./RosterSchema");

var gameSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  rosters: [RosterSchema.schema],
});

const model = mongoose.model('Game', gameSchema);

module.exports = {
    model,
    schema: gameSchema
}