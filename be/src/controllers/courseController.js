const fs = require("fs");
const Course = require("../models/Course");
const { extractTextFromPDF } = require("../services/pdfExtractor");
const { checkCourseBadges } = require("../services/badgeService");

// POST /api/courses — upload PDF (req.file) ou texte collé (req.body.rawText)
const uploadCourse = async (req, res, next) => {
  try {
    const { title, subject, rawText, folder, group } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Le titre du cours est requis",
      });
    }

    let content = "";
    let sourceFile = null;

    if (req.file) {
      content = await extractTextFromPDF(req.file.path);
      sourceFile = req.file.originalname;

      // On garde seulement le texte extrait
      fs.unlink(req.file.path, () => {});
    } else if (rawText && rawText.trim().length > 0) {
      content = rawText.trim();
    } else {
      return res.status(400).json({
        message: "Fournir un fichier PDF ou du texte",
      });
    }

    const course = await Course.create({
      user: req.user._id,
      folder: folder || null,
      group: group || null,
      title,
      subject,
      sourceFile,
      rawContent: content,
    });

    const newBadges = await checkCourseBadges(req.user._id);

    return res.status(201).json({
      message: "Cours importé avec succès",
      course: {
        id: course._id,
        title: course.title,
        subject: course.subject,
        sourceFile: course.sourceFile,
        contentPreview: content.slice(0, 300),
        importedAt: course.importedAt,
      },
      newBadges,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/courses
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ user: req.user._id })
      .select("-rawContent")
      .sort({ createdAt: -1 });

    return res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
};

// GET /api/courses/:id
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Cours introuvable",
      });
    }

    return res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};

// PUT /api/courses/:id — modifier titre/matière/dossier d'un cours
const updateCourse = async (req, res, next) => {
  try {
    const { title, subject, folder } = req.body;

    const course = await Course.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        title,
        subject,
        folder: folder || null,
      },
      {
        new: true,
      }
    );

    if (!course) {
      return res.status(404).json({
        message: "Cours introuvable",
      });
    }

    return res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/courses/:id — supprime le cours et tout ce qui en dépend
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Cours introuvable",
      });
    }

    // Suppression des données liées au cours
    const Summary = require("../models/Summary");
    const Quiz = require("../models/Quiz");
    const ExamPrediction = require("../models/ExamPrediction");
    const Progress = require("../models/Progress");

    await Promise.all([
      Summary.deleteMany({ course: course._id }),
      Quiz.deleteMany({ course: course._id }),
      ExamPrediction.deleteMany({ course: course._id }),
      Progress.deleteMany({ course: course._id }),
    ]);

    return res.status(200).json({
      message: "Cours supprimé",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};