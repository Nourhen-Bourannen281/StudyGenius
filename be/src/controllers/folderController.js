const Folder = require("../models/Folder");
const Course = require("../models/Course");

// POST /api/folders
const createFolder = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Le nom du dossier est requis" });
    }

    const folder = await Folder.create({ user: req.user._id, name, color });
    return res.status(201).json({ folder });
  } catch (error) {
    next(error);
  }
};

// GET /api/folders — liste des dossiers avec le nombre de cours dans chacun
const getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ createdAt: -1 });

    // On ajoute le nombre de cours par dossier (pratique pour l'affichage)
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const courseCount = await Course.countDocuments({ folder: folder._id });
        return { ...folder.toObject(), courseCount };
      })
    );

    return res.status(200).json({ folders: foldersWithCount });
  } catch (error) {
    next(error);
  }
};

// GET /api/folders/:id/courses — cours contenus dans un dossier précis
const getCoursesInFolder = async (req, res, next) => {
  try {
    const courses = await Course.find({
      user: req.user._id,
      folder: req.params.id,
    })
      .select("-rawContent")
      .sort({ createdAt: -1 });

    return res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
};

// PUT /api/folders/:id — renommer/changer la couleur d'un dossier
const updateFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ message: "Dossier introuvable" });
    }

    return res.status(200).json({ folder });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/folders/:id — supprime le dossier (les cours dedans deviennent "non classés")
const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!folder) {
      return res.status(404).json({ message: "Dossier introuvable" });
    }

    // On ne supprime PAS les cours, on les détache juste du dossier
    await Course.updateMany({ folder: folder._id }, { folder: null });

    return res.status(200).json({ message: "Dossier supprimé" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createFolder, getFolders, getCoursesInFolder, updateFolder, deleteFolder };