const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getMyBadges, getMyStreak } = require("../controllers/badgeController");

const router = express.Router();

router.use(protect);

router.get("/streak", getMyStreak);
router.get("/", getMyBadges);

module.exports = router;