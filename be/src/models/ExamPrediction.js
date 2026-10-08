const mongoose = require("mongoose");

const predictedQuestionSchema = new mongoose.Schema(
  {
    concept: { type: String, required: true }, // le concept concerné
    question: { type: String, required: true }, // question probable formulée
    justification: { type: String, required: true }, // pourquoi ce concept est probable
    probability: { type: Number, min: 0, max: 100 }, // score de probabilité estimé
  },
  { _id: false }
);

const examPredictionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    predictedQuestions: [predictedQuestionSchema],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamPrediction", examPredictionSchema);