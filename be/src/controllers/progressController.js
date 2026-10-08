const Progress = require("../models/Progress");

// GET /api/courses/:id/progress — progression sur UN cours précis
const getCourseProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.id,
    });

    if (!progress) {
      return res.status(200).json({
        masteredConcepts: [],
        conceptsToReview: [],
        overallScore: 0,
        quizHistory: [],
      });
    }

    return res.status(200).json({ progress });
  } catch (error) {
    next(error);
  }
};

// GET /api/progress — vue d'ensemble, tous cours confondus (pour le dashboard)
const getOverallProgress = async (req, res, next) => {
  try {
    const progressList = await Progress.find({ user: req.user._id })
      .populate("course", "title subject") // récupère titre/matière du cours lié
      .sort({ updatedAt: -1 });

    return res.status(200).json({ progressList });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourseProgress, getOverallProgress };