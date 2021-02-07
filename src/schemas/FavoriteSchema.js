var mongoose = require ("mongoose");

var favoriteSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  description: { type: String, trim: true },
  info: { type: String, trim: true },
  url: { type: String, trim: true },
});

const model = mongoose.model('Favorite', favoriteSchema);

module.exports = {
    model,
    schema: gameSchema
}