// matchRoutes.js
const express = require("express");
const { processDelivery } = require("../controller/deliveryController");
const router = express.Router();
router.post("/delivery/:matchId", async (req, res) => {
  try {
    const delivery = await processDelivery(req.params.matchId, req.body);
    req.app.get("io").emit(`match-${req.params.matchId}`, {
      type: "new-delivery",
      data: delivery,
    });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
