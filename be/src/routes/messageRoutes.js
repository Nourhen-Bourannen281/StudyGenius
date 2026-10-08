const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getGroupMessages } = require("../controllers/messageController");

const router = express.Router();

router.use(protect);

router.get("/:id/messages", getGroupMessages);

module.exports = router;