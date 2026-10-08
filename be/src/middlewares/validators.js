const { body, validationResult } = require("express-validator");

// Middleware qui vérifie les erreurs collectées par les règles ci-dessous
// et renvoie une réponse 400 claire si l'une d'elles échoue
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Données invalides",
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Le nom est requis").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Email invalide").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Le mot de passe doit faire au moins 6 caractères"),
  handleValidationErrors,
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Email invalide").normalizeEmail(),
  body("password").notEmpty().withMessage("Mot de passe requis"),
  handleValidationErrors,
];

const courseUploadValidation = [
  body("title").trim().notEmpty().withMessage("Le titre est requis").isLength({ max: 200 }),
  handleValidationErrors,
];

module.exports = { registerValidation, loginValidation, courseUploadValidation };