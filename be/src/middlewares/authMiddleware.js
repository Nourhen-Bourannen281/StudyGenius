const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Ce middleware protège les routes : il vérifie que le token JWT
// envoyé dans le header Authorization est valide avant de laisser
// la requête continuer vers le controller
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      // Le header a la forme "Bearer <token>", on récupère la 2e partie
      token = authHeader.split(" ")[1];

      // Vérifie la signature et l'expiration du token avec la clé secrète
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // On récupère l'utilisateur correspondant (sans le mot de passe)
      // et on l'attache à req.user pour que les controllers suivants
      // sachent "qui" fait la requête
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur introuvable" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }
  }

  return res.status(401).json({ message: "Accès refusé, aucun token fourni" });
};

module.exports = { protect };