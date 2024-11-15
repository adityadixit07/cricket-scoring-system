const express = require("express");
const {
  getCommentary,
  processDelivery,
  fetchInitialData,
  updateMatchStatus,
  editDelivery,
  updateBatsman,
  updateBowler,
  changeStriker,
  endOver,
  undoDelivery,
} = require("../controller/matchController");
const router = express.Router();

// Existing routes
router.post("/delivery/:matchId", processDelivery);
router.get("/match/:matchId", fetchInitialData);

// New routes
router.put("/match/:matchId", updateMatchStatus);
router.put("/delivery/:deliveryId", editDelivery);
router.put("/player/:playerId/batting", updateBatsman);
router.put("/player/:playerId/bowling", updateBowler);
router.post("/match/:matchId/change-striker", changeStriker);
router.post("/match/:matchId/end-over", endOver);
router.post("/match/:matchId/undo-delivery", undoDelivery);
router.get("/match/:matchId/commentary", getCommentary);

module.exports = router;
