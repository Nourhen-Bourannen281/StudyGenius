const Course = require("../models/Course");
const Quiz = require("../models/Quiz");
const { generateQuizFromContent } = require("../services/aiService");
const { updateProgressAfterQuiz } = require("../services/progressService");
const { checkQuizBadges } = require("../services/badgeService");
const { updateStreak } = require("../services/streakService");
// POST /api/courses/:id/quiz — body: { difficulty }
const generateQuiz = async (req, res, next) => {
  try {
    const { difficulty = "moyen" } = req.body;

    const course = await Course.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Cours introuvable",
      });
    }

    const aiResult = await generateQuizFromContent(
      course.rawContent,
      difficulty
    );

    const quiz = await Quiz.create({
      course: course._id,
      questions: aiResult.questions,
      difficulty,
    });

    return res.status(201).json({ quiz });
  } catch (error) {
    next(error);
  }
};

// GET /api/quizzes/:id
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz introuvable",
      });
    }

    return res.status(200).json({ quiz });
  } catch (error) {
    next(error);
  }
};

// POST /api/quizzes/:id/submit — body: { answers: [{ questionIndex, answer }] }
const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz introuvable",
      });
    }

    // Comparaison des réponses données avec les bonnes réponses stockées
    let correctCount = 0;

    const correction = quiz.questions.map((q, index) => {
      const userAnswer =
        answers.find((a) => a.questionIndex === index)?.answer ?? null;

      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round(
      (correctCount / quiz.questions.length) * 100
    );

    // Vérifie les badges gagnés grâce au score du quiz
    const newBadges = await checkQuizBadges(req.user._id, score);
    const streakResult = await updateStreak(req.user._id);
    // Met à jour la progression
    await updateProgressAfterQuiz({
      userId: req.user._id,
      courseId: quiz.course,
      quizId: quiz._id,
      score,
    });

    return res.status(200).json({ score, correction, newBadges, streak: streakResult?.streak });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuiz,
  getQuizById,
  submitQuiz,
};