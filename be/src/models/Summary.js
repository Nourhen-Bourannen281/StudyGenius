const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    sections: [
      {
        heading: { type: String, required: true }, // titre de la section
        content: { type: String, required: true }, // texte de la section
      },
    ],
    keyPoints: [
      {
        type: String, // liste de points clés / définitions importantes
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);