const mongoose = require("mongoose");
const deliverySchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  over: Number,
  ball: Number,
  batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  runs: {
    total: Number,
    batsman: Number,
    extras: Number,
  },
  extras: {
    type: { type: String, enum: ["wide", "noBall", "bye", "legBye"] },
    runs: Number,
    hasOverthrow: Boolean,
    overthrowRuns: Number,
  },
  isWicket: Boolean,
  wicketType: {
    type: String,
    enum: ["bowled", "caught", "lbw", "runOut", "stumped", "hitWicket"],
  },
  timestamp: { type: Date, default: Date.now },
});

const Delivery = mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;
