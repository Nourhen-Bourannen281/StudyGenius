const genAI = require("../config/aiClient");

// Fonction utilitaire : envoie un prompt à Gemini et parse la réponse en JSON
const askAIForJSON = async (systemPrompt, userPrompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  const rawText = result.response.text();

  // On retire d'éventuels ```json ... ``` que le modèle pourrait ajouter
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("Réponse IA invalide (JSON mal formé)");
  }
};

// --- 1. Génération du résumé structuré ---
const generateSummaryFromContent = async (courseContent) => {
  const systemPrompt = `Tu es un assistant pédagogique. Tu reçois le contenu brut d'un cours
et tu dois produire un résumé structuré. Réponds UNIQUEMENT avec un JSON valide,
sans texte avant ni après, au format exact suivant :
{
  "sections": [{ "heading": "string", "content": "string" }],
  "keyPoints": ["string"]
}`;

  const userPrompt = `Voici le contenu du cours à résumer :\n\n${courseContent.slice(0, 12000)}`;

  return askAIForJSON(systemPrompt, userPrompt);
};

// --- 2. Génération d'un quiz personnalisé ---
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

  return askAIForJSON(systemPrompt, userPrompt);
};

// --- 3. Génération des prédictions d'examen ---
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

  return askAIForJSON(systemPrompt, userPrompt);
};

module.exports = {
  generateSummaryFromContent,
  generateQuizFromContent,
  generatePredictionsFromContent,
};