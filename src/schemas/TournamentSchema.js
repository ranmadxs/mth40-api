var mongoose = require ("mongoose");

var tournamentSchema = new mongoose.Schema({
  id: { type: Number, required: true },  
  name: { type: String, required: true },
  url: { type: String, required: false },
  tournament_type: { type: String, required: false },
  game_name: { type: String, required: false },
  state: { type: String, required: false },
  event_id: { type: Number, required: false },
  created_at: {type: Date, required: false },
  started_at: {type: Date, required: false },
  completed_at: {type: Date, required: false },
  game_id: { type: Number, required: false },
  game_name: { type: String, required: false },
  participants_count: { type: Number, required: false },
  progress_meter: { type: Number, required: false },
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date, default: Date.now},
  isActive: { type: Boolean, required: true, default: true },
  matches:[],
  participants:[],
});

tournamentSchema.index({ 'id': 1 }, { unique: true });
const model = mongoose.model('Tournament', tournamentSchema);
       
module.exports = {
  model,
  schema: tournamentSchema
}