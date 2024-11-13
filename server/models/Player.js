const mongoose = require("mongoose");
const playerSchema = new mongoose.Schema({
  name: String,
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  batting: {
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    status: { type: String, enum: ["yet_to_bat", "batting", "out"] },
  },
  bowling: {
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
  },
});

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;
