const fs = require("fs");
const pdfParse = require("pdf-parse");
const anthropic = require("../config/aiClient");
const Progress = require("../models/Progress");

/* =========================================================
   1. EXTRACTION DE TEXTE PDF
   ========================================================= */

// Prend le chemin d'un fichier PDF stocké temporairement sur le disque
// (placé là par Multer) et retourne son contenu textuel brut
const extractTextFromPDF = async (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(fileBuffer);
  return data.text; // texte concaténé de toutes les pages
};

/* =========================================================
   2. SERVICE IA (appels à Claude)
   ========================================================= */

// Fonction utilitaire : envoie un prompt à Claude et parse la réponse en JSON
const askClaudeForJSON = async (systemPrompt, userPrompt) => {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  // On retire d'éventuels ```json ... ``` que le modèle pourrait ajouter
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("Réponse IA invalide (JSON mal formé)");
  }
};

// --- Génération du résumé structuré ---
const generateSummaryFromContent = async (courseContent) => {
  const systemPrompt = `Tu es un assistant pédagogique. Tu reçois le contenu brut d'un cours
et tu dois produire un résumé structuré. Réponds UNIQUEMENT avec un JSON valide,
sans texte avant ni après, au format exact suivant :
{
  "sections": [{ "heading": "string", "content": "string" }],
  "keyPoints": ["string"]
}`;
  const userPrompt = `Voici le contenu du cours à résumer :\n\n${courseContent.slice(0, 12000)}`;
  return askClaudeForJSON(systemPrompt, userPrompt);
};

// --- Génération d'un quiz personnalisé ---
const generateQuizFromContent = async (courseContent, difficulty) => {
  const systemPrompt = `Tu es un assistant pédagogique. Tu génères un quiz de niveau "${difficulty}"
à partir d'un cours. Réponds UNIQUEMENT avec un JSON valide, format exact :
{
  "questions": [
    {
      "question": "string",
      "type": "mcq",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (doit être exactement une des options)",
      "explanation": "string"
    }
  ]
}
Génère entre 5 et 8 questions de type "mcq" (choix multiples).`;
  const userPrompt = `Voici le contenu du cours :\n\n${courseContent.slice(0, 12000)}`;
  return askClaudeForJSON(systemPrompt, userPrompt);
};

// --- Génération des prédictions d'examen ---
const generatePredictionsFromContent = async (courseContent) => {
  const systemPrompt = `Tu es un assistant pédagogique expert en analyse de cours.
Identifie les concepts les plus susceptibles d'apparaître à l'examen, en te basant
sur leur fréquence, leur importance dans la structure du cours, et le type
d'exercices associés. Réponds UNIQUEMENT avec un JSON valide, format exact :
{
  "predictedQuestions": [
    {
      "concept": "string",
      "question": "string",
      "justification": "string (courte, factuelle)",
      "probability": 0
    }
  ]
}
"probability" est un nombre entre 0 et 100. Génère entre 4 et 6 prédictions.`;
  const userPrompt = `Voici le contenu du cours :\n\n${courseContent.slice(0, 12000)}`;
  return askClaudeForJSON(systemPrompt, userPrompt);
};

/* =========================================================
   3. SERVICE DE PROGRESSION
   ========================================================= */

// Appelée après la soumission d'un quiz (voir quizController.submitQuiz)
// Met à jour (ou crée) le document Progress correspondant à ce user + ce cours
const updateProgressAfterQuiz = async ({ userId, courseId, quizId, score }) => {
  let progress = await Progress.findOne({ user: userId, course: courseId });

  if (!progress) {
    progress = new Progress({
      user: userId,
      course: courseId,
      masteredConcepts: [],
      conceptsToReview: [],
      overallScore: 0,
      quizHistory: [],
    });
  }

  progress.quizHistory.push({ quiz: quizId, score, takenAt: new Date() });

  // Le score global devient la moyenne de tous les quiz passés sur ce cours
  const totalScore = progress.quizHistory.reduce((sum, entry) => sum + entry.score, 0);
  progress.overallScore = Math.round(totalScore / progress.quizHistory.length);

  await progress.save();
  return progress;
};

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  extractTextFromPDF,
  generateSummaryFromContent,
  generateQuizFromContent,
  generatePredictionsFromContent,
  updateProgressAfterQuiz,
};