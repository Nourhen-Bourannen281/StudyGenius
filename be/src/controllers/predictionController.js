const Course = require("../models/Course");
const ExamPrediction = require("../models/ExamPrediction");
const { generatePredictionsFromContent } = require("../services/aiService");

// POST /api/courses/:id/predictions
const generatePredictions = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    const aiResult = await generatePredictionsFromContent(course.rawContent);

    const prediction = await ExamPrediction.findOneAndUpdate(
      { course: course._id },
      {
        course: course._id,
        predictedQuestions: aiResult.predictedQuestions,
        generatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({ prediction });
  } catch (error) {
    next(error);
  }
};

// GET /api/courses/:id/predictions
const getPredictions = async (req, res, next) => {
  try {
    const prediction = await ExamPrediction.findOne({ course: req.params.id });

    if (!prediction) {
      return res.status(404).json({ message: "Aucune prédiction générée pour ce cours" });
    }

    return res.status(200).json({ prediction });
  } catch (error) {
    next(error);
  }
};

module.exports = { generatePredictions, getPredictions };