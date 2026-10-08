// Version simplifiée de mongo-sanitize : supprime récursivement toute clé
// commençant par "$" ou contenant "." dans req.body et req.params,
// pour empêcher les injections NoSQL (ex: { "$gt": "" })
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      continue; // on ignore cette clé, potentiellement malveillante
    }
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.params) req.params = sanitizeObject(req.params);
  // req.query n'est pas modifié : lecture seule sous Express 5
  next();
};

module.exports = sanitizeMiddleware;