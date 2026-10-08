const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createFolder,
  getFolders,
  getCoursesInFolder,
  updateFolder,
  deleteFolder,
} = require("../controllers/folderController");

const router = express.Router();

router.use(protect);

router.post("/", createFolder);
router.get("/", getFolders);
router.get("/:id/courses", getCoursesInFolder);
router.put("/:id", updateFolder);
router.delete("/:id", deleteFolder);

module.exports = router;