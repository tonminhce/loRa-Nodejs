const express = require("express");
const router = express.Router();

const authController = require('../controllers/authController');
router.post("/signIn", authController.signIn);
router.post("/signUp", authController.signUp);
router.get("/stage", authController.getCurrentStage);
router.post("/updateCurrentStage", authController.updateCurrentStage);

module.exports = router;

