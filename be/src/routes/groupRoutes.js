const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupById,
  getGroupCourses,
  getGroupLeaderboard,
  getVideoToken,
} = require("../controllers/groupController");

const router = express.Router();

router.use(protect);

router.post("/", createGroup);
router.post("/join", joinGroup);
router.get("/", getMyGroups);
router.get("/:id", getGroupById);
router.get("/:id/courses", getGroupCourses);
router.get("/:id/leaderboard", getGroupLeaderboard);
router.get("/:id/video-token", getVideoToken);
module.exports = router;