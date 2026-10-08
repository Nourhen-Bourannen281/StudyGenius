const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: 6,
      select: false,
    },
    studyLevel: {
      type: String,
      enum: ["lycee", "licence", "master", "autre"],
      default: "autre",
    },
    badges: [
      {
        badgeId: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: null },
      activeDates: [{ type: Date }],
    },
  },
  
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);