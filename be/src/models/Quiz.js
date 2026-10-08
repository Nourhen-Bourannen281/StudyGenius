const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ["mcq", "true_false", "open"], // MCQ / vrai-faux / question ouverte
      required: true,
    },
    options: [{ type: String }], // utilisé seulement pour les MCQ
    correctAnswer: { type: String, required: true },
    explanation: { type: String }, // explication affichée après la réponse
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    questions: [questionSchema],
    difficulty: {
      type: String,
      enum: ["facile", "moyen", "difficile"],
      default: "moyen",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);