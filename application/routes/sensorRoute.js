const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");

router.get("/all", sensorController.getAllData);
router.get("/:sensor-id", sensorController.getSensorData);

module.exports = router;
