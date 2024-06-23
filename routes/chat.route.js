const express = require("express");
const {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
  getListingMessages
} = require("../controllers/chat.controller.js");
const { verifyToken } = require("../middleware/verifyToken.js");

const router = express.Router();

router.post("/", verifyToken, createChat);
router.get("/", verifyToken, getChats);
// router.get("/:chatId/messages", verifyToken, getChatMessages);
router.post("/messages", verifyToken, getListingMessages);
router.post("/message", verifyToken, sendMessage);

module.exports = router;
