const Course = require("../models/Course");
const Summary = require("../models/Summary");
const { generateSummaryFromContent } = require("../services/aiService");
const { generateSummaryPDF } = require("../services/pdfExportService");

// POST /api/courses/:id/summary — génère (ou régénère) le résumé d'un cours
const generateSummary = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    // Appel au service IA : envoie le texte du cours, reçoit un JSON structuré
    const aiResult = await generateSummaryFromContent(course.rawContent);

    // upsert : si un résumé existe déjà pour ce cours, on le remplace
    const summary = await Summary.findOneAndUpdate(
      { course: course._id },
      {
        course: course._id,
        sections: aiResult.sections,
        keyPoints: aiResult.keyPoints,
        generatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({ summary });
  } catch (error) {
    next(error);
  }
};

// GET /api/courses/:id/summary
const getSummary = async (req, res, next) => {
  try {
    const summary = await Summary.findOne({ course: req.params.id });

    if (!summary) {
      return res.status(404).json({ message: "Aucun résumé généré pour ce cours" });
    }

    return res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

// GET /api/courses/:id/summary/pdf — télécharge le résumé au format PDF
const downloadSummaryPDF = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    const summary = await Summary.findOne({ course: req.params.id });
    if (!summary) {
      return res.status(404).json({ message: "Aucun résumé généré pour ce cours" });
    }

    generateSummaryPDF(res, {
      courseTitle: course.title,
      courseSubject: course.subject,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateSummary, getSummary, downloadSummaryPDF };