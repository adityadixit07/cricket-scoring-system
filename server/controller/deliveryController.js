const Delivery = require("../models/Delivery");
const Match = require("../models/Match");
const Player = require("../models/Player");

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

module.exports = { processDelivery };
