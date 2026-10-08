const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getQuizById, submitQuiz } = require("../controllers/quizController");

const router = express.Router();

router.use(protect);

router.get("/:id", getQuizById); // récupérer un quiz pour le passer
router.post("/:id/submit", submitQuiz); // soumettre les réponses et obtenir le score

module.exports = router;