const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null, // si rempli, le cours est visible par tout le groupe
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: "Général",
    },
    sourceFile: {
      type: String,
      default: null,
    },
    rawContent: {
      type: String,
      required: true,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);