const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  teamA: {
    name: String,
    score: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    extras: {
      wide: { type: Number, default: 0 },
      noBall: { type: Number, default: 0 },
      bye: { type: Number, default: 0 },
      legBye: { type: Number, default: 0 },
    },
  },
  teamB: {
    name: String,
    score: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    extras: {
      wide: { type: Number, default: 0 },
      noBall: { type: Number, default: 0 },
      bye: { type: Number, default: 0 },
      legBye: { type: Number, default: 0 },
    },
  },
  currentInnings: { type: String, enum: ["teamA", "teamB"] },
  status: {
    type: String,
    enum: ["upcoming", "live", "completed"],
    default: "upcoming",
  },
  date: Date,
});

const Match = mongoose.model("Match", matchSchema);

module.exports = Match;
