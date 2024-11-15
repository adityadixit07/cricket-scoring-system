import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const MainBoard = () => {
  const [match, setMatch] = useState({
    teamA: {
      name: "",
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: { wide: 0, noBall: 0, legBye: 0, bye: 0 },
    },
    teamB: {
      name: "",
      score: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: { wide: 0, noBall: 0, legBye: 0, bye: 0 },
    },
    currentInnings: "teamA",
    status: "live",
  });

  const [players, setPlayers] = useState({
    teamA: [],
    teamB: [],
  });

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [currentBowler, setCurrentBowler] = useState(null);
  const [commentary, setCommentary] = useState([]);
  const [currentDelivery, setCurrentDelivery] = useState({
    isWide: false,
    isNoBall: false,
    batsmanRuns: 0,
    byeRuns: 0,
    legByeRuns: 0,
    overthrowRuns: 0,
  });

  const MATCH_ID = "6737161e71390ffffb023e46";
  const API_BASE_URL = "https://cricket-scoring-system.onrender.com/api";

  useEffect(() => {
    const socket = io("https://cricket-scoring-system.onrender.com/");
    socket.emit("join-match", MATCH_ID);

    socket.on("match-update", (data) => {
      setMatch(data.match);
      setPlayers(data.players);
      if (data.delivery) {
        setCommentary((prev) => [data.delivery, ...prev]);
      }
    });

    fetchInitialData();

    return () => socket.disconnect();
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/match/${MATCH_ID}`);
      const { match, players, striker, nonStriker } = response.data.data;

      setMatch(match);
      setPlayers(players);
      setStriker(striker);
      setNonStriker(nonStriker);
      setCurrentBowler(match.currentBowler);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleDeliveryClick = async (type) => {
    let deliveryData = {
      ...currentDelivery,
      batsmanId: striker?._id,
      bowlerId: currentBowler?._id,
      matchId: MATCH_ID,
    };

    switch (type) {
      case "WD":
        deliveryData.isWide = true;
        break;
      case "NB":
        deliveryData.isNoBall = true;
        break;
      case "B":
        deliveryData.byeRuns = 1;
        break;
      case "LB":
        deliveryData.legByeRuns = 1;
        break;
      case "W":
        deliveryData.isWicket = true;
        break;
      default:
        deliveryData.batsmanRuns = parseInt(type);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/delivery/${MATCH_ID}`,
        deliveryData
      );

      // Reset current delivery state
      setCurrentDelivery({
        isWide: false,
        isNoBall: false,
        batsmanRuns: 0,
        byeRuns: 0,
        legByeRuns: 0,
        overthrowRuns: 0,
      });

      // Check for end of over
      if (
        match.teamB.balls % 6 === 5 &&
        !deliveryData.isWide &&
        !deliveryData.isNoBall
      ) {
        await handleEndOfOver();
      }
    } catch (error) {
      console.error("Error processing delivery:", error);
    }
  };

  const handleEndOfOver = async () => {
    try {
      await axios.post(`${API_BASE_URL}/match/${MATCH_ID}/end-over`);
      await changeStriker();
    } catch (error) {
      console.error("Error ending over:", error);
    }
  };

  const changeStriker = async () => {
    try {
      await axios.post(`${API_BASE_URL}/match/${MATCH_ID}/change-striker`);
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    } catch (error) {
      console.error("Error changing striker:", error);
    }
  };

  const undoLastDelivery = async () => {
    try {
      await axios.post(`${API_BASE_URL}/match/${MATCH_ID}/undo-delivery`);
      await fetchInitialData();
    } catch (error) {
      console.error("Error undoing delivery:", error);
    }
  };

  const currentTeam =
    match.currentInnings === "teamA" ? match.teamA : match.teamB;
  const runs = ["0", "1", "2", "3", "4", "6", "W", "WD", "NB", "B", "LB"];

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scoring Controls */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Match Controls</h2>

          {/* Player Selection */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <label className="font-medium">Striker:</label>
              <select
                className="border rounded p-2"
                value={striker?._id || ""}
                onChange={(e) =>
                  setStriker(
                    players.teamB.find((p) => p._id === e.target.value)
                  )
                }
              >
                <option value="">Select Striker</option>
                {players.teamB?.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <label className="font-medium">Non-Striker:</label>
              <select
                className="border rounded p-2"
                value={nonStriker?._id || ""}
                onChange={(e) =>
                  setNonStriker(
                    players.teamB.find((p) => p._id === e.target.value)
                  )
                }
              >
                <option value="">Select Non-Striker</option>
                {players.teamB?.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <label className="font-medium">Bowler:</label>
              <select
                className="border rounded p-2"
                value={currentBowler?._id || ""}
                onChange={(e) =>
                  setCurrentBowler(
                    players.teamA.find((p) => p._id === e.target.value)
                  )
                }
              >
                <option value="">Select Bowler</option>
                {players.teamA?.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Run Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {runs.map((run) => (
              <button
                key={run}
                onClick={() => handleDeliveryClick(run)}
                className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
              >
                {run}
              </button>
            ))}
          </div>

          {/* Additional Controls */}
          <div className="space-y-2">
            <button
              onClick={changeStriker}
              className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Change Strike
            </button>
            <button
              onClick={undoLastDelivery}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Undo Last Ball
            </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold">{currentTeam.name}</h2>
            <div className="text-3xl font-bold">
              {currentTeam.score}/{currentTeam.wickets}
            </div>
            <div className="text-lg">
              {Math.floor(currentTeam.balls / 6)}.{currentTeam.balls % 6} overs
            </div>
            <div className="text-sm text-gray-600">
              Extras: W{currentTeam.extras.wide} NB{currentTeam.extras.noBall} B
              {currentTeam.extras.bye} LB{currentTeam.extras.legBye}
            </div>
          </div>

          {/* Current Partnership */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">Current Partnership</h3>
            <div className="space-y-1">
              <div>{striker?.name} * </div>
              <div>{nonStriker?.name}</div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Current Bowler</h3>
            <div>{currentBowler?.name}</div>
          </div>
        </div>
      </div>

      {/* Commentary */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Ball by Ball Commentary</h2>
        <div className="space-y-2">
          {commentary.map((delivery, index) => (
            <div key={index} className="p-2 border-b">
              {delivery.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainBoard;
