const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getOverallProgress } = require("../controllers/progressController");

const router = express.Router();

router.use(protect);

router.get("/", getOverallProgress);

module.exports = router;