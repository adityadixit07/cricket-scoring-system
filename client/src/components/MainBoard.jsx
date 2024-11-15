// import React, { useState, useEffect } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const MainBoard = () => {
//   const [match, setMatch] = useState({
//     teamName: "",
//     score: 0,
//     wickets: 0,
//     overs: 0,
//     balls: 0,
//     extras: {
//       wide: 0,
//       noBall: 0,
//       legBye: 0,
//       bye: 0,
//     },
//   });

//   const [players, setPlayers] = useState({
//     batsmen: [],
//     bowlers: [],
//   });

//   const [currentDelivery, setCurrentDelivery] = useState({
//     isWide: false,
//     isNoBall: false,
//     batsmanRuns: 0,
//     byeRuns: 0,
//     legByeRuns: 0,
//     overthrowRuns: 0,
//   });

//   const [commentary, setCommentary] = useState([]);
//   const [striker, setStriker] = useState(null);
//   const [nonStriker, setNonStriker] = useState(null);
//   const [currentBowler, setCurrentBowler] = useState(null);

//   // Socket connection
//   useEffect(() => {
//     const socket = io("http://localhost:5000/");
//     socket.emit("join-match", "6736babc6d18415038bdeaa6"); // Replace with actual match ID

//     socket.on("match-update", (data) => {
//       setMatch(data.match);
//       setPlayers(data.players);
//       setCommentary((prev) => [data.delivery, ...prev]);
//     });

//     return () => socket.disconnect();
//   }, []);

//   // Handle delivery button click
//   const handleDeliveryClick = async (type) => {
//     let deliveryData = {
//       ...currentDelivery,
//       batsmanId: striker?.id,
//       bowlerId: currentBowler?.id,
//       matchId: "6736babc6d18415038bdeaa6", // Replace with actual match ID
//     };

//     switch (type) {
//       case "WD":
//         deliveryData.isWide = true;
//         break;
//       case "NB":
//         deliveryData.isNoBall = true;
//         break;
//       case "B":
//         deliveryData.byeRuns = 1;
//         break;
//       case "LB":
//         deliveryData.legByeRuns = 1;
//         break;
//       case "W":
//         deliveryData.isWicket = true;
//         break;
//       default:
//         deliveryData.batsmanRuns = parseInt(type);
//     }

//     try {
//       const response = await axios.post(
//         `http://localhost:5000//api/delivery/${deliveryData.matchId}`,
//         deliveryData
//       );
//       console.log(response?.data);

//       // Reset current delivery state
//       setCurrentDelivery({
//         isWide: false,
//         isNoBall: false,
//         batsmanRuns: 0,
//         byeRuns: 0,
//         legByeRuns: 0,
//         overthrowRuns: 0,
//       });

//       // Handle end of over
//       if (
//         match.balls % 6 === 5 &&
//         !deliveryData.isWide &&
//         !deliveryData.isNoBall
//       ) {
//         handleEndOfOver();
//       }
//     } catch (error) {
//       console.error("Error processing delivery:", error);
//     }
//   };

//   // Handle end of over
//   const handleEndOfOver = () => {
//     // Swap striker and non-striker
//     const temp = striker;
//     setStriker(nonStriker);
//     setNonStriker(temp);
//   };

//   // Handle player selection
//   const handlePlayerSelect = (player, role) => {
//     switch (role) {
//       case "striker":
//         setStriker(player);
//         break;
//       case "nonStriker":
//         setNonStriker(player);
//         break;
//       case "bowler":
//         setCurrentBowler(player);
//         break;
//     }
//   };

//   const runs = [1, 2, 3, 4, 6, "W", "WD", "NB", "B", "LB"];

//   return (
//     <div className="container mx-auto p-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         {/* Left Section - Commentary Controls */}
//         <div className="border rounded-lg p-4 bg-white shadow-sm">
//           <h2 className="text-xl font-bold mb-4">Match Controls</h2>

//           {/* Batsmen Info */}
//           <div className="space-y-3 mb-4">
//             <div className="flex justify-between items-center">
//               <label className="font-medium">Striker:</label>
//               <select
//                 className="border rounded p-1"
//                 onChange={(e) =>
//                   handlePlayerSelect(
//                     players.batsmen.find((p) => p.id === e.target.value),
//                     "striker"
//                   )
//                 }
//               >
//                 <option value="">Select Striker</option>
//                 {players.batsmen.map((player) => (
//                   <option key={player.id} value={player.id}>
//                     {player.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex justify-between items-center">
//               <label className="font-medium">Non-Striker:</label>
//               <select
//                 className="border rounded p-1"
//                 onChange={(e) =>
//                   handlePlayerSelect(
//                     players.batsmen.find((p) => p.id === e.target.value),
//                     "nonStriker"
//                   )
//                 }
//               >
//                 <option value="">Select Non-Striker</option>
//                 {players.batsmen.map((player) => (
//                   <option key={player.id} value={player.id}>
//                     {player.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Run Buttons */}
//           <div className="grid grid-cols-5 gap-2 mb-4">
//             {runs.map((run) => (
//               <button
//                 key={run}
//                 className="px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors"
//                 onClick={() => handleDeliveryClick(run)}
//               >
//                 {run}
//               </button>
//             ))}
//           </div>

//           <button
//             className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
//             onClick={() => handleDeliveryClick("new")}
//           >
//             New Ball
//           </button>
//         </div>

//         {/* Right Section - Team Scorecard */}
//         <div className="border rounded-lg p-4 bg-white shadow-sm">
//           <div className="border rounded-md p-3 mb-4">
//             <h3 className="font-bold text-lg">{match.teamName}</h3>
//             <p className="text-xl font-bold">
//               {match.score}/{match.wickets}
//             </p>
//             <p>
//               {Math.floor(match.balls / 6)}.{match.balls % 6} overs
//             </p>
//             <div className="text-sm text-gray-600">
//               Wide: {match.extras.wide} | NoBall: {match.extras.noBall} |
//               LegBye: {match.extras.legBye} | Bye: {match.extras.bye}
//             </div>
//           </div>

//           {/* Players Scorecard */}
//           <div className="space-y-4">
//             {/* Batsmen */}
//             <div>
//               <h3 className="font-bold mb-2">Batsmen</h3>
//               <div className="space-y-2">
//                 {players.batsmen.map((player) => (
//                   <button
//                     key={player.id}
//                     className="w-full text-left px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors"
//                   >
//                     {player.name} - {player.batting.runs}({player.batting.balls}
//                     )
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Bowlers */}
//             <div>
//               <h3 className="font-bold mb-2">Bowlers</h3>
//               <div className="space-y-2">
//                 {players.bowlers.map((player) => (
//                   <button
//                     key={player.id}
//                     className="w-full text-left px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors"
//                   >
//                     {player.name} - {player.bowling.wickets}/
//                     {player.bowling.runs} (
//                     {Math.floor(player.bowling.balls / 6)}.
//                     {player.bowling.balls % 6})
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Section - Ball by Ball Commentary */}
//       <div className="border rounded-lg p-4 bg-white shadow-sm">
//         <h2 className="text-xl font-bold mb-4">Ball by Ball Commentary</h2>
//         <div className="space-y-2">
//           {commentary.map((delivery, index) => (
//             <div
//               key={index}
//               className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50"
//             >
//               <span>
//                 Over {Math.floor(delivery.ball / 6)}.{delivery.ball % 6}:{" "}
//                 {delivery.description}
//               </span>
//               <button className="p-2 rounded-full hover:bg-gray-200">
//                 <span className="text-gray-600">✎</span>
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MainBoard;

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import { toast } from "react-hot-toast"; // Add react-hot-toast for notifications

const API_BASE_URL = "http://localhost:5000/api";
let socket;

const MainBoard = () => {
  // State Management
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
    currentInnings: {
      striker: null,
      nonStriker: null,
      currentBowler: null,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const matchId = "6736babc6d18415038bdeaa6"; // Replace with actual match ID or get from props/route

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/match/${matchId}`);
        setMatch(response.data.match);
        setPlayers({
          batsmen: response.data.teamAPlayers,
          bowlers: response.data.teamBPlayers,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error("Failed to load match data");
      }
    };

    fetchInitialData();
  }, [matchId]);

  // Socket connection
  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.emit("join-match", matchId);

    socket.on("match-update", handleMatchUpdate);

    return () => {
      socket.off("match-update");
      socket.disconnect();
    };
  }, [matchId]);

  // Handle socket updates
  const handleMatchUpdate = (data) => {
    switch (data.type) {
      case "new-delivery":
        setMatch(data.data.match);
        setCommentary((prev) => [data.data.delivery, ...prev]);
        break;
      case "delivery-edit":
        setMatch(data.data.match);
        setCommentary((prev) =>
          prev.map((del) =>
            del._id === data.data.delivery._id ? data.data.delivery : del
          )
        );
        break;
      case "striker-change":
      case "over-end":
        setMatch(data.data.match);
        break;
      default:
        break;
    }
  };

  // API calls
  const handleDeliverySubmit = async (deliveryData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/delivery/${matchId}`,
        deliveryData
      );
      toast.success("Delivery recorded");
      return response.data;
    } catch (err) {
      toast.error("Failed to record delivery");
      throw err;
    }
  };

  const handleEndOver = async () => {
    try {
      await axios.post(`${API_BASE_URL}/match/${matchId}/end-over`);
      toast.success("Over completed");
    } catch (err) {
      toast.error("Failed to end over");
    }
  };

  const handleUndoDelivery = async () => {
    try {
      await axios.post(`${API_BASE_URL}/match/${matchId}/undo-delivery`);
      toast.success("Delivery undone");
    } catch (err) {
      toast.error("Failed to undo delivery");
    }
  };

  const handleChangeStriker = async () => {
    try {
      await axios.post(`${API_BASE_URL}/match/${matchId}/change-striker`);
      toast.success("Strikers rotated");
    } catch (err) {
      toast.error("Failed to change striker");
    }
  };

  // Event handlers
  const handleDeliveryClick = async (type) => {
    let deliveryData = {
      ...currentDelivery,
      batsmanId: match.currentInnings.striker,
      bowlerId: match.currentInnings.currentBowler,
      matchId,
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
      await handleDeliverySubmit(deliveryData);

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
        match.balls % 6 === 5 &&
        !deliveryData.isWide &&
        !deliveryData.isNoBall
      ) {
        await handleEndOver();
      }
    } catch (error) {
      console.error("Error processing delivery:", error);
    }
  };

  const handlePlayerSelect = async (playerId, role) => {
    try {
      const updatedMatch = {
        ...match,
        currentInnings: {
          ...match.currentInnings,
          [role]: playerId,
        },
      };

      await axios.put(`${API_BASE_URL}/match/${matchId}`, updatedMatch);
      setMatch(updatedMatch);
    } catch (err) {
      toast.error(`Failed to update ${role}`);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center">Error: {error}</div>;

  const runs = [1, 2, 3, 4, 6, "W", "WD", "NB", "B", "LB"];

  return (
    <div className="container mx-auto p-4">
      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Match Controls</h2>

          {/* Player Selection */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <label className="font-medium">Striker:</label>
              <select
                className="border rounded p-1"
                value={match.currentInnings.striker || ""}
                onChange={(e) => handlePlayerSelect(e.target.value, "striker")}
              >
                <option value="">Select Striker</option>
                {players.batsmen.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <label className="font-medium">Non-Striker:</label>
              <select
                className="border rounded p-1"
                value={match.currentInnings.nonStriker || ""}
                onChange={(e) =>
                  handlePlayerSelect(e.target.value, "nonStriker")
                }
              >
                <option value="">Select Non-Striker</option>
                {players.batsmen.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <label className="font-medium">Bowler:</label>
              <select
                className="border rounded p-1"
                value={match.currentInnings.currentBowler || ""}
                onChange={(e) =>
                  handlePlayerSelect(e.target.value, "currentBowler")
                }
              >
                <option value="">Select Bowler</option>
                {players.bowlers.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Controls */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {runs.map((run) => (
              <button
                key={run}
                className="px-3 py-2 border rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => handleDeliveryClick(run)}
                disabled={
                  !match.currentInnings.striker ||
                  !match.currentInnings.currentBowler
                }
              >
                {run}
              </button>
            ))}
          </div>

          {/* Additional Controls */}
          <div className="space-y-2">
            <button
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
              onClick={handleChangeStriker}
            >
              Rotate Strike
            </button>

            <button
              className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
              onClick={handleUndoDelivery}
            >
              Undo Last Delivery
            </button>
          </div>
        </div>

        {/* Scorecard */}
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
              Extras: W{match.extras.wide} | NB{match.extras.noBall} | LB
              {match.extras.legBye} | B{match.extras.bye}
            </div>
          </div>

          {/* Current Players */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Current Batsmen</h3>
              <div className="space-y-2">
                {players.batsmen
                  .filter((p) =>
                    [
                      match.currentInnings.striker,
                      match.currentInnings.nonStriker,
                    ].includes(p._id)
                  )
                  .map((player) => (
                    <div
                      key={player._id}
                      className="px-3 py-2 border rounded-md"
                    >
                      {player.name} - {player.batting.runs}(
                      {player.batting.balls})
                      {player._id === match.currentInnings.striker && " *"}
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Current Bowler</h3>
              <div className="space-y-2">
                {players.bowlers
                  .filter((p) => p._id === match.currentInnings.currentBowler)
                  .map((player) => (
                    <div
                      key={player._id}
                      className="px-3 py-2 border rounded-md"
                    >
                      {player.name} - {player.bowling.wickets}/
                      {player.bowling.runs}(
                      {Math.floor(player.bowling.balls / 6)}.
                      {player.bowling.balls % 6})
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commentary */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">Ball by Ball Commentary</h2>
        <div className="space-y-2">
          {commentary.map((delivery, index) => (
            <div
              key={delivery._id || index}
              className="flex items-center justify-between border rounded-md p-3 hover:bg-gray-50"
            >
              <span>
                Over {Math.floor(delivery.ball / 6)}.{delivery.ball % 6}:{" "}
                {delivery.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainBoard;
