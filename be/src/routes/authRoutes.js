const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimiters");
const router = express.Router();
const { registerValidation, loginValidation } = require("../middlewares/validators");
router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.get("/me", protect, getMe);

module.exports = router;