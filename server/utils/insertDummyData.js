const mongoose = require("mongoose");
const Team = require("../models/Team");
const Player = require("../models/Player");
const Match = require("../models/Match");

async function insertDummyData() {
  try {
    // Check if dummy data already exists
    const existingMatches = await Match.find();
    if (existingMatches.length > 0) {
      console.log("Dummy data already exists");
      return;
    }

    // 1. Create Teams with players array
    const teams = [
      {
        name: "India",
        shortName: "IND",
        players: [], // Will be populated later
      },
      {
        name: "Australia",
        shortName: "AUS",
        players: [], // Will be populated later
      },
    ];

    const teamDocs = await Team.insertMany(teams);
    const indiaTeam = teamDocs.find((team) => team.shortName === "IND");
    const australiaTeam = teamDocs.find((team) => team.shortName === "AUS");

    // 2. Create Players for India
    const indiaPlayersData = [
      {
        name: "Virat Kohli",
        team: indiaTeam._id,
        runs: 45,
        ballsFaced: 35,
        fours: 5,
        sixes: 2,
        status: "out",
        battingOrder: 1,
      },
      {
        name: "Rohit Sharma",
        team: indiaTeam._id,
        runs: 55,
        ballsFaced: 42,
        fours: 6,
        sixes: 3,
        status: "out",
        battingOrder: 2,
      },
      {
        name: "KL Rahul",
        team: indiaTeam._id,
        runs: 30,
        ballsFaced: 25,
        fours: 4,
        sixes: 1,
        status: "batting",
        battingOrder: 3,
      },
      {
        name: "Jasprit Bumrah",
        team: indiaTeam._id,
        overs: 4,
        balls: 24,
        maidens: 1,
        runsGiven: 25,
        wickets: 2,
        battingOrder: 4,
      },
      {
        name: "Ravindra Jadeja",
        team: indiaTeam._id,
        overs: 4,
        balls: 24,
        maidens: 0,
        runsGiven: 35,
        wickets: 1,
        battingOrder: 5,
      },
    ];

    // 3. Create Players for Australia
    const australiaPlayersData = [
      {
        name: "Steve Smith",
        team: australiaTeam._id,
        runs: 60,
        ballsFaced: 40,
        fours: 7,
        sixes: 2,
        status: "batting",
        battingOrder: 1,
      },
      {
        name: "David Warner",
        team: australiaTeam._id,
        runs: 20,
        ballsFaced: 15,
        fours: 3,
        sixes: 1,
        status: "out",
        battingOrder: 2,
      },
      {
        name: "Glenn Maxwell",
        team: australiaTeam._id,
        runs: 10,
        ballsFaced: 8,
        fours: 2,
        sixes: 0,
        status: "yet_to_bat",
        battingOrder: 3,
      },
      {
        name: "Mitchell Starc",
        team: australiaTeam._id,
        overs: 4,
        balls: 24,
        maidens: 1,
        runsGiven: 30,
        wickets: 3,
        battingOrder: 4,
      },
      {
        name: "Pat Cummins",
        team: australiaTeam._id,
        overs: 4,
        balls: 24,
        maidens: 0,
        runsGiven: 40,
        wickets: 2,
        battingOrder: 5,
      },
    ];

    // Insert players into the database
    const indiaPlayers = await Player.insertMany(indiaPlayersData);
    const australiaPlayers = await Player.insertMany(australiaPlayersData);

    // Update teams with player references
    indiaTeam.players = indiaPlayers.map((player) => player._id);
    australiaTeam.players = australiaPlayers.map((player) => player._id);

    await indiaTeam.save();
    await australiaTeam.save();

    // 4. Create a match with updated structure
    const matchData = {
      teamA: {
        name: indiaTeam.name,
        score: 160,
        wickets: 5,
        overs: 20,
        balls: 120,
        extras: {
          wide: 5,
          noBall: 2,
          bye: 1,
          legBye: 3,
        },
        players: indiaPlayers.map((player) => player._id),
      },
      teamB: {
        name: australiaTeam.name,
        score: 70,
        wickets: 2,
        overs: 10,
        balls: 60,
        extras: {
          wide: 3,
          noBall: 1,
          bye: 0,
          legBye: 2,
        },
        players: australiaPlayers.map((player) => player._id),
      },
      currentInnings: "teamB",
      inningsDetails: {
        teamA: {
          striker: indiaPlayers.find((player) => player.name === "KL Rahul")
            ._id,
          nonStriker: indiaPlayers.find(
            (player) => player.name === "Rohit Sharma"
          )._id,
        },
        teamB: {
          striker: australiaPlayers.find(
            (player) => player.name === "Steve Smith"
          )._id,
          nonStriker: australiaPlayers.find(
            (player) => player.name === "David Warner"
          )._id,
        },
      },
      currentBowler: australiaPlayers.find(
        (player) => player.name === "Pat Cummins"
      )._id,
      status: "live",
      date: new Date(),
    };

    const createdMatch = await Match.create(matchData);

    console.log("Dummy data inserted successfully!");
    console.log(`Match ID: ${createdMatch._id}`);
    console.log(`Teams: ${indiaTeam.name} vs ${australiaTeam.name}`);
    console.log(
      "Players per team:",
      indiaPlayers.length,
      australiaPlayers.length
    );

    return {
      match: createdMatch,
      teams: {
        teamA: indiaTeam,
        teamB: australiaTeam,
      },
      players: {
        teamA: indiaPlayers,
        teamB: australiaPlayers,
      },
    };
  } catch (error) {
    console.error("Error inserting dummy data:", error);
    throw error;
  }
}

module.exports = insertDummyData;
