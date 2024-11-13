const teams = [
  { _id: "team1", name: "Team A" },
  { _id: "team2", name: "Team B" },
];

const players = [
  {
    name: "Virat Kohli",
    team: "team1",
    batting: {
      runs: 5432,
      balls: 6789,
      fours: 450,
      sixes: 120,
      status: "batting",
    },
    bowling: {
      overs: 12,
      balls: 72,
      maidens: 2,
      runs: 150,
      wickets: 5,
    },
  },
  {
    name: "Rohit Sharma",
    team: "team1",
    batting: {
      runs: 4567,
      balls: 5678,
      fours: 380,
      sixes: 90,
      status: "out",
    },
    bowling: {
      overs: 8,
      balls: 48,
      maidens: 1,
      runs: 120,
      wickets: 3,
    },
  },
  {
    name: "Kane Williamson",
    team: "team2",
    batting: {
      runs: 3456,
      balls: 4567,
      fours: 300,
      sixes: 60,
      status: "yet_to_bat",
    },
    bowling: {
      overs: 10,
      balls: 60,
      maidens: 1,
      runs: 180,
      wickets: 4,
    },
  },
  {
    name: "Joe Root",
    team: "team2",
    batting: {
      runs: 2345,
      balls: 3456,
      fours: 250,
      sixes: 40,
      status: "batting",
    },
    bowling: {
      overs: 6,
      balls: 36,
      maidens: 0,
      runs: 90,
      wickets: 2,
    },
  },
];

module.exports = { teams, players };
