const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#5b6ef5", // couleur d'affichage dans le frontend
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Folder", folderSchema);