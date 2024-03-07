const express = require("express");
const router = express.Router();

const chatController = require('../controllers/chatController');

router.post("/send", chatController.sendMessage);
router.get("/:chatroom_id/messages", chatController.getMessages);


module.exports = router;