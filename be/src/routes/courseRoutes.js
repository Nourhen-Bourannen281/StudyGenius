const express = require("express");
const upload = require("../config/multerConfig");
const { protect } = require("../middlewares/authMiddleware");
const { aiLimiter } = require("../middlewares/rateLimiters");
const { uploadCourse, getCourses, getCourseById, updateCourse, deleteCourse } = require("../controllers/courseController");
const { generateSummary, getSummary,  downloadSummaryPDF } = require("../controllers/summaryController");
const { generateQuiz } = require("../controllers/quizController");
const { generatePredictions, getPredictions } = require("../controllers/predictionController");
const { getCourseProgress } = require("../controllers/progressController");
const { courseUploadValidation } = require("../middlewares/validators");
const router = express.Router();

// Toutes les routes de ce fichier nécessitent d'être connecté
router.use(protect);

// --- Cours ---
router.post("/", upload.single("file"), uploadCourse); // upload PDF ou texte
router.get("/", getCourses); // liste des cours de l'utilisateur
router.get("/:id", getCourseById); // détail d'un cours
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

// --- Résumé (lié à un cours précis) ---
router.post("/:id/summary",aiLimiter, generateSummary);
router.get("/:id/summary", getSummary);

// --- Quiz (génération liée à un cours précis) ---
router.post("/:id/quiz",aiLimiter, generateQuiz);

// --- Prédictions d'examen (liées à un cours précis) ---
router.post("/:id/predictions", aiLimiter, generatePredictions);
router.get("/:id/predictions", getPredictions);

// --- Progression sur ce cours précis ---
router.get("/:id/progress", getCourseProgress);
router.get("/:id/summary/pdf", downloadSummaryPDF);

router.post("/", upload.single("file"), courseUploadValidation, uploadCourse);
module.exports = router;