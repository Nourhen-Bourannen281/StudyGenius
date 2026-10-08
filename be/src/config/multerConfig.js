const multer = require("multer");
const path = require("path");

// Définit où et sous quel nom les fichiers uploadés sont stockés sur le disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    // On préfixe par un timestamp pour éviter les collisions de noms
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Filtre : n'accepte que les fichiers PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers PDF sont acceptés"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // limite : 10 Mo
});

module.exports = upload;