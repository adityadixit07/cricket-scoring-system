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

    // 1. Create Teams
    const teams = [
      { name: "India", shortName: "IND" },
      { name: "Australia", shortName: "AUS" },
    ];

    const teamDocs = await Team.insertMany(teams);
    const indiaTeam = teamDocs.find((team) => team.shortName === "IND");
    const australiaTeam = teamDocs.find((team) => team.shortName === "AUS");

    // 2. Create Players for India
    const indiaPlayersData = [
      {
        name: "Virat Kohli",
        team: indiaTeam._id,
        batting: { runs: 45, balls: 35, fours: 5, sixes: 2, status: "out" },
      },
      {
        name: "Rohit Sharma",
        team: indiaTeam._id,
        batting: { runs: 55, balls: 42, fours: 6, sixes: 3, status: "out" },
      },
      {
        name: "KL Rahul",
        team: indiaTeam._id,
        batting: { runs: 30, balls: 25, fours: 4, sixes: 1, status: "batting" },
      },
      {
        name: "Jasprit Bumrah",
        team: indiaTeam._id,
        bowling: { overs: 4, balls: 24, maidens: 1, runs: 25, wickets: 2 },
      },
      {
        name: "Ravindra Jadeja",
        team: indiaTeam._id,
        bowling: { overs: 4, balls: 24, maidens: 0, runs: 35, wickets: 1 },
      },
    ];

    // 3. Create Players for Australia
    const australiaPlayersData = [
      {
        name: "Steve Smith",
        team: australiaTeam._id,
        batting: { runs: 60, balls: 40, fours: 7, sixes: 2, status: "batting" },
      },
      {
        name: "David Warner",
        team: australiaTeam._id,
        batting: { runs: 20, balls: 15, fours: 3, sixes: 1, status: "out" },
      },
      {
        name: "Glenn Maxwell",
        team: australiaTeam._id,
        batting: {
          runs: 10,
          balls: 8,
          fours: 2,
          sixes: 0,
          status: "yet_to_bat",
        },
      },
      {
        name: "Mitchell Starc",
        team: australiaTeam._id,
        bowling: { overs: 4, balls: 24, maidens: 1, runs: 30, wickets: 3 },
      },
      {
        name: "Pat Cummins",
        team: australiaTeam._id,
        bowling: { overs: 4, balls: 24, maidens: 0, runs: 40, wickets: 2 },
      },
    ];

    // Insert players into the database
    const indiaPlayers = await Player.insertMany(indiaPlayersData);
    const australiaPlayers = await Player.insertMany(australiaPlayersData);

    // 4. Create a match with detailed stats, including striker/non-striker and bowler
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
      },
      currentInnings: "teamB",
      inningsDetails: {
        teamA: {
          striker: indiaPlayers.find((player) => player.name === "KL Rahul")
            ._id, // Set striker for team A
          nonStriker: indiaPlayers.find(
            (player) => player.name === "Rohit Sharma"
          )._id, // Set non-striker for team A
        },
        teamB: {
          striker: australiaPlayers.find(
            (player) => player.name === "Steve Smith"
          )._id, // Set striker for team B
          nonStriker: australiaPlayers.find(
            (player) => player.name === "David Warner"
          )._id, // Set non-striker for team B
        },
      },
      currentBowler: australiaPlayers.find(
        (player) => player.name === "Pat Cummins"
      )._id, // Set bowler
      status: "live",
      date: new Date(),
    };

    const createdMatch = await Match.create(matchData);

    console.log("Teams, Players, and Match Data Inserted Successfully:");
    console.log(`Match ID: ${createdMatch._id}`);
    console.log(`Teams: ${indiaTeam.name} vs ${australiaTeam.name}`);
  } catch (error) {
    console.error("Error inserting dummy data:", error);
  }
}

module.exports = insertDummyData;
