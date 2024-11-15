const mongoose = require("mongoose");
const Delivery = require("../models/Delivery");
const Match = require("../models/Match");
const Player = require("../models/Player");

// Match Controllers
const updateMatchStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId).session(session);
    if (!match) {
      throw new Error("Match not found");
    }

    // Update match status based on request body
    Object.assign(match, req.body);
    await match.save({ session });

    // Emit socket event for real-time updates
    req.app.get("io").to(`match-${matchId}`).emit("match-update", {
      type: "match-status",
      data: { match },
    });

    await session.commitTransaction();
    res.json({ message: "Match status updated successfully", match });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Delivery Controllers
const editDelivery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deliveryId } = req.params;
    const delivery = await Delivery.findById(deliveryId).session(session);
    if (!delivery) {
      throw new Error("Delivery not found");
    }

    // Get original delivery data for reverting stats
    const originalDelivery = { ...delivery.toObject() };

    // Update delivery with new data
    Object.assign(delivery, req.body);
    await delivery.save({ session });

    // Update match and player statistics
    const match = await Match.findById(delivery.match).session(session);
    const batsman = await Player.findById(delivery.batsman).session(session);
    const bowler = await Player.findById(delivery.bowler).session(session);

    // Revert original stats
    match.teamA.score -= originalDelivery.runs.total;
    if (
      !originalDelivery.extras.type ||
      originalDelivery.extras.type === "normal"
    ) {
      match.teamA.balls -= 1;
      batsman.batting.balls -= 1;
      bowler.bowling.balls -= 1;
    }

    // Apply new stats
    match.teamA.score += delivery.runs.total;
    if (!delivery.extras.type || delivery.extras.type === "normal") {
      match.teamA.balls += 1;
      batsman.batting.balls += 1;
      bowler.bowling.balls += 1;
    }

    await Promise.all([
      match.save({ session }),
      batsman.save({ session }),
      bowler.save({ session }),
    ]);

    // Emit socket event
    req.app.get("io").to(`match-${delivery.match}`).emit("match-update", {
      type: "delivery-edit",
      data: { delivery, match },
    });

    await session.commitTransaction();
    res.json({ message: "Delivery updated successfully", delivery });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Player Controllers
const updateBatsman = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId).session(session);
    if (!player) {
      throw new Error("Player not found");
    }

    // Update batting statistics
    player.batting = {
      ...player.batting,
      ...req.body,
    };

    await player.save({ session });

    await session.commitTransaction();
    res.json({ message: "Batsman statistics updated successfully", player });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

const updateBowler = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId).session(session);
    if (!player) {
      throw new Error("Player not found");
    }

    // Update bowling statistics
    player.bowling = {
      ...player.bowling,
      ...req.body,
    };

    await player.save({ session });

    await session.commitTransaction();
    res.json({ message: "Bowler statistics updated successfully", player });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Match Control Controllers
const changeStriker = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId).session(session);
    if (!match) {
      throw new Error("Match not found");
    }

    // Determine the current inning
    const currentInnings = match.currentInnings;
    const inningsDetails = match.inningsDetails[currentInnings];

    // Swap striker and non-striker
    const temp = inningsDetails.striker;
    inningsDetails.striker = inningsDetails.nonStriker;
    inningsDetails.nonStriker = temp;

    await match.save({ session });
    req.app
      .get("io")
      .to(`match-${matchId}`)
      .emit("match-update", {
        type: "striker-change",
        data: {
          striker: inningsDetails.striker,
          nonStriker: inningsDetails.nonStriker,
        },
      });

    await session.commitTransaction();
    res.json({ message: "Striker changed successfully", match });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

const endOver = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId).session(session);
    if (!match) {
      throw new Error("Match not found");
    }

    // Swap striker and non-striker at end of over
    const temp = match.currentInnings.striker;
    match.currentInnings.striker = match.currentInnings.nonStriker;
    match.currentInnings.nonStriker = temp;

    // Reset current bowler
    match.currentInnings.currentBowler = null;

    await match.save({ session });

    // Emit socket event
    req.app.get("io").to(`match-${matchId}`).emit("match-update", {
      type: "over-end",
      data: { match },
    });

    await session.commitTransaction();
    res.json({ message: "Over ended successfully", match });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

const undoDelivery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId).session(session);
    if (!match) {
      throw new Error("Match not found");
    }

    // Find the last delivery
    const lastDelivery = await Delivery.findOne({
      match: matchId,
    })
      .sort({ _id: -1 })
      .session(session);

    if (!lastDelivery) {
      throw new Error("No delivery to undo");
    }

    // Revert match statistics
    match.teamA.score -= lastDelivery.runs.total;
    if (!lastDelivery.extras.type || lastDelivery.extras.type === "normal") {
      match.teamA.balls -= 1;
    }

    // Revert player statistics
    const batsman = await Player.findById(lastDelivery.batsman).session(
      session
    );
    const bowler = await Player.findById(lastDelivery.bowler).session(session);

    if (batsman) {
      batsman.batting.runs -= lastDelivery.runs.batsman;
      batsman.batting.balls -= 1;
      await batsman.save({ session });
    }

    if (bowler) {
      bowler.bowling.runs -= lastDelivery.runs.total;
      bowler.bowling.balls -= 1;
      await bowler.save({ session });
    }

    // Delete the delivery
    await lastDelivery.deleteOne({ session });
    await match.save({ session });

    // Emit socket event
    req.app.get("io").to(`match-${matchId}`).emit("match-update", {
      type: "delivery-undo",
      data: { match },
    });

    await session.commitTransaction();
    res.json({ message: "Last delivery undone successfully", match });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

const getCommentary = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const deliveries = await Delivery.find({ match: matchId })
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("batsman", "name")
      .populate("bowler", "name");

    const total = await Delivery.countDocuments({ match: matchId });

    res.json({
      deliveries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processDelivery = async (matchId, deliveryData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const match = await Match.findById(matchId);
    const batsman = await Player.findById(deliveryData.batsmanId);
    const bowler = await Player.findById(deliveryData.bowlerId);

    let runsToAdd = 0;
    let ballsToAdd = 1;
    let deliveryType = "normal";

    // Process Wide
    if (deliveryData.isWide) {
      runsToAdd += 1; // Base wide run
      deliveryType = "wide";
      ballsToAdd = 0; // Wide doesn't count as a legal ball

      if (deliveryData.extraRuns) {
        runsToAdd += deliveryData.extraRuns;
      }

      match.extras.wide += runsToAdd;
      bowler.bowling.runs += runsToAdd;
    }

    // Process No Ball
    else if (deliveryData.isNoBall) {
      runsToAdd += 1; // Base no ball run
      deliveryType = "noBall";
      ballsToAdd = 0; // No ball doesn't count as a legal ball

      match.extras.noBall += 1;

      if (deliveryData.byeRuns) {
        runsToAdd += deliveryData.byeRuns;
        match.extras.bye += deliveryData.byeRuns;
      } else if (deliveryData.legByeRuns) {
        runsToAdd += deliveryData.legByeRuns;
        match.extras.legBye += deliveryData.legByeRuns;
      } else if (deliveryData.batsmanRuns) {
        runsToAdd += deliveryData.batsmanRuns;
        batsman.batting.runs += deliveryData.batsmanRuns;
      }

      bowler.bowling.runs += runsToAdd;
    }

    // Process Normal Delivery
    else {
      if (deliveryData.batsmanRuns) {
        runsToAdd += deliveryData.batsmanRuns;
        batsman.batting.runs += deliveryData.batsmanRuns;
        bowler.bowling.runs += deliveryData.batsmanRuns;
      }

      if (deliveryData.byeRuns) {
        runsToAdd += deliveryData.byeRuns;
        match.extras.bye += deliveryData.byeRuns;
      }

      if (deliveryData.legByeRuns) {
        runsToAdd += deliveryData.legByeRuns;
        match.extras.legBye += deliveryData.legByeRuns;
      }
    }

    // Process Overthrows
    if (deliveryData.overthrowRuns) {
      runsToAdd += deliveryData.overthrowRuns;
      if (
        deliveryData.isWide ||
        deliveryData.byeRuns ||
        deliveryData.legByeRuns
      ) {
        match.extras[deliveryType] += deliveryData.overthrowRuns;
      } else {
        batsman.batting.runs += deliveryData.overthrowRuns;
      }
    }

    // Update match score
    match.teamA.score += runsToAdd;
    if (ballsToAdd) {
      match.teamA.balls += 1;
      batsman.batting.balls += 1;
      bowler.bowling.balls += 1;
    }

    // Create delivery record
    const delivery = new Delivery({
      match: matchId,
      over: Math.floor(match.teamA.balls / 6),
      ball: (match.teamA.balls % 6) + 1,
      batsman: deliveryData.batsmanId,
      bowler: deliveryData.bowlerId,
      runs: {
        total: runsToAdd,
        batsman: deliveryData.batsmanRuns || 0,
        extras: runsToAdd - (deliveryData.batsmanRuns || 0),
      },
      extras: {
        type: deliveryType,
        runs: deliveryType !== "normal" ? runsToAdd : 0,
        hasOverthrow: !!deliveryData.overthrowRuns,
        overthrowRuns: deliveryData.overthrowRuns || 0,
      },
    });

    await delivery.save({ session });
    await match.save({ session });
    await batsman.save({ session });
    await bowler.save({ session });

    await session.commitTransaction();
    return delivery;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const fetchInitialData = async (req, res, next) => {
  try {
    const { matchId } = req.params;

    // Validate matchId
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: "Invalid match ID format" });
    }

    // Fetch match details with populated fields
    const match = await Match.findById(matchId)
      .populate("inningsDetails.teamA.striker", "name runs ballsFaced")
      .populate("inningsDetails.teamA.nonStriker", "name runs ballsFaced")
      .populate("inningsDetails.teamB.striker", "name runs ballsFaced")
      .populate("inningsDetails.teamB.nonStriker", "name runs ballsFaced")
      .populate("currentBowler", "name overs wickets runsGiven")
      .lean();

    // Check if match exists
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Initialize default structure if missing
    const safeMatch = {
      ...match,
      teamA: match.teamA || { players: [] },
      teamB: match.teamB || { players: [] },
      inningsDetails: match.inningsDetails || { teamA: {}, teamB: {} },
    };

    // Safely fetch players with error handling
    let teamAPlayers = [],
      teamBPlayers = [];

    if (safeMatch.teamA?.players?.length > 0) {
      teamAPlayers = await Player.find({
        _id: { $in: safeMatch.teamA.players },
      })
        .lean()
        .catch((err) => {
          console.error("Error fetching Team A players:", err);
          return [];
        });
    }

    if (safeMatch.teamB?.players?.length > 0) {
      teamBPlayers = await Player.find({
        _id: { $in: safeMatch.teamB.players },
      })
        .lean()
        .catch((err) => {
          console.error("Error fetching Team B players:", err);
          return [];
        });
    }

    // Determine current innings safely
    const currentInnings = safeMatch.currentInnings || "teamA";
    const currentInningsDetails =
      safeMatch.inningsDetails[currentInnings] || {};

    // Find striker and non-striker safely
    const allPlayers = [...teamAPlayers, ...teamBPlayers];
    const striker = currentInningsDetails.striker
      ? allPlayers.find(
          (p) => p._id.toString() === currentInningsDetails.striker.toString()
        )
      : null;
    const nonStriker = currentInningsDetails.nonStriker
      ? allPlayers.find(
          (p) =>
            p._id.toString() === currentInningsDetails.nonStriker.toString()
        )
      : null;

    // Construct response data
    const responseData = {
      match: safeMatch,
      players: {
        teamA: teamAPlayers || [],
        teamB: teamBPlayers || [],
      },
      striker: striker || null,
      nonStriker: nonStriker || null,
      currentInnings,
    };

    // Add debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("Match Data:", JSON.stringify(responseData, null, 2));
    }

    return res.json({
      message: "Initial data fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error in fetchInitialData:", error);
    return res.status(500).json({
      message: "Internal server error while fetching match data",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  updateMatchStatus,
  editDelivery,
  updateBatsman,
  updateBowler,
  changeStriker,
  endOver,
  undoDelivery,
  getCommentary,
  processDelivery,
  fetchInitialData,
};
