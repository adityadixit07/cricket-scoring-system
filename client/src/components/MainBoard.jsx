import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const MainBoard = () => {
  const [match, setMatch] = useState({
    teamName: "",
    score: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: {
      wide: 0,
      noBall: 0,
      legBye: 0,
      bye: 0,
    },
  });

  const [players, setPlayers] = useState({
    batsmen: [],
    bowlers: [],
  });

  const [currentDelivery, setCurrentDelivery] = useState({
    isWide: false,
    isNoBall: false,
    batsmanRuns: 0,
    byeRuns: 0,
    legByeRuns: 0,
    overthrowRuns: 0,
  });

  const [commentary, setCommentary] = useState([]);
  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [currentBowler, setCurrentBowler] = useState(null);

  // Socket connection
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.emit("join-match", "match-id"); // Replace with actual match ID

    socket.on("match-update", (data) => {
      setMatch(data.match);
      setPlayers(data.players);
      setCommentary((prev) => [data.delivery, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  // Handle delivery button click
  const handleDeliveryClick = async (type) => {
    let deliveryData = {
      ...currentDelivery,
      batsmanId: striker?.id,
      bowlerId: currentBowler?.id,
      matchId: "match-id", // Replace with actual match ID
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
      const response = await fetch("/api/delivery/match-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryData),
      });

      if (!response.ok) throw new Error("Delivery processing failed");

      // Reset current delivery state
      setCurrentDelivery({
        isWide: false,
        isNoBall: false,
        batsmanRuns: 0,
        byeRuns: 0,
        legByeRuns: 0,
        overthrowRuns: 0,
      });

      // Handle end of over
      if (
        match.balls % 6 === 5 &&
        !deliveryData.isWide &&
        !deliveryData.isNoBall
      ) {
        handleEndOfOver();
      }
    } catch (error) {
      console.error("Error processing delivery:", error);
    }
  };

  // Handle end of over
  const handleEndOfOver = () => {
    // Swap striker and non-striker
    const temp = striker;
    setStriker(nonStriker);
    setNonStriker(temp);
  };

  // Handle player selection
  const handlePlayerSelect = (player, role) => {
    switch (role) {
      case "striker":
        setStriker(player);
        break;
      case "nonStriker":
        setNonStriker(player);
        break;
      case "bowler":
        setCurrentBowler(player);
        break;
    }
  };

  const runs = [1, 2, 3, 4, 6, "W", "WD", "NB", "B", "LB"];

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left Section - Commentary Controls */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Match Controls</h2>

          {/* Batsmen Info */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <label className="font-medium">Striker:</label>
              <select
                className="border rounded p-1"
                onChange={(e) =>
                  handlePlayerSelect(
                    players.batsmen.find((p) => p.id === e.target.value),
                    "striker"
                  )
                }
              >
                <option value="">Select Striker</option>
                {players.batsmen.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label className="font-medium">Non-Striker:</label>
              <select
                className="border rounded p-1"
                onChange={(e) =>
                  handlePlayerSelect(
                    players.batsmen.find((p) => p.id === e.target.value),
                    "nonStriker"
                  )
                }
              >
                <option value="">Select Non-Striker</option>
                {players.batsmen.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Run Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {runs.map((run) => (
              <button
                key={run}
                className="px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => handleDeliveryClick(run)}
              >
                {run}
              </button>
            ))}
          </div>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => handleDeliveryClick("new")}
          >
            New Ball
          </button>
        </div>

        {/* Right Section - Team Scorecard */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="border rounded-md p-3 mb-4">
            <h3 className="font-bold text-lg">{match.teamName}</h3>
            <p className="text-xl font-bold">
              {match.score}/{match.wickets}
            </p>
            <p>
              {Math.floor(match.balls / 6)}.{match.balls % 6} overs
            </p>
            <div className="text-sm text-gray-600">
              Wide: {match.extras.wide} | NoBall: {match.extras.noBall} |
              LegBye: {match.extras.legBye} | Bye: {match.extras.bye}
            </div>
          </div>

          {/* Players Scorecard */}
          <div className="space-y-4">
            {/* Batsmen */}
            <div>
              <h3 className="font-bold mb-2">Batsmen</h3>
              <div className="space-y-2">
                {players.batsmen.map((player) => (
                  <button
                    key={player.id}
                    className="w-full text-left px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {player.name} - {player.batting.runs}({player.batting.balls}
                    )
                  </button>
                ))}
              </div>
            </div>

            {/* Bowlers */}
            <div>
              <h3 className="font-bold mb-2">Bowlers</h3>
              <div className="space-y-2">
                {players.bowlers.map((player) => (
                  <button
                    key={player.id}
                    className="w-full text-left px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {player.name} - {player.bowling.wickets}/
                    {player.bowling.runs} (
                    {Math.floor(player.bowling.balls / 6)}.
                    {player.bowling.balls % 6})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Ball by Ball Commentary */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">Ball by Ball Commentary</h2>
        <div className="space-y-2">
          {commentary.map((delivery, index) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50"
            >
              <span>
                Over {Math.floor(delivery.ball / 6)}.{delivery.ball % 6}:{" "}
                {delivery.description}
              </span>
              <button className="p-2 rounded-full hover:bg-gray-200">
                <span className="text-gray-600">✎</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainBoard;
