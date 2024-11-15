const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  teamA: {
    name: { type: String, required: true },
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
    name: { type: String, required: true },
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
  currentInnings: {
    type: String,
    enum: ["teamA", "teamB"],
    default: "teamA",
  },
  inningsDetails: {
    teamA: {
      striker: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      nonStriker: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    },
    teamB: {
      striker: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      nonStriker: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    },
  },
  currentBowler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  status: {
    type: String,
    enum: ["upcoming", "live", "completed"],
    default: "upcoming",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Match = mongoose.model("Match", matchSchema);

module.exports = Match; // Exporting the Match model correctly
