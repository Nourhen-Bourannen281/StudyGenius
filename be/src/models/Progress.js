const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    masteredConcepts: [{ type: String }], // concepts déjà maîtrisés
    conceptsToReview: [{ type: String }], // concepts à revoir
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    quizHistory: [
      {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        score: { type: Number },
        takenAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Un utilisateur n'a qu'un seul document Progress par cours
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);