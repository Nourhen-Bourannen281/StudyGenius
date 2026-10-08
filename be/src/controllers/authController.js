const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Génère un token JWT contenant l'id de l'utilisateur
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, studyLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nom, email et mot de passe sont requis" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email" });
    }

    const user = await User.create({ name, email, password, studyLevel });

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, studyLevel: user.studyLevel },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe sont requis" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, studyLevel: user.studyLevel },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me (protégée)
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, getMe };