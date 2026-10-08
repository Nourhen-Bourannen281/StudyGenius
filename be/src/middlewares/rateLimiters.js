const rateLimit = require("express-rate-limit");

// Limite générale : protège toute l'API contre un usage abusif
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requêtes max par IP sur cette fenêtre
  message: { message: "Trop de requêtes, réessaie dans quelques minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite stricte spécifique au login/register : contre le brute-force de mot de passe
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // seulement 10 tentatives de login/register par IP sur 15 minutes
  message: { message: "Trop de tentatives de connexion, réessaie plus tard" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite pour les appels IA (coûteux, à protéger contre l'abus)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 30, // 30 générations IA max par heure et par IP
  message: { message: "Limite de générations IA atteinte, réessaie dans une heure" },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, aiLimiter };