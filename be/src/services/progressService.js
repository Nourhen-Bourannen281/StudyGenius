const Progress = require("../models/Progress");

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

  const totalScore = progress.quizHistory.reduce((sum, entry) => sum + entry.score, 0);
  progress.overallScore = Math.round(totalScore / progress.quizHistory.length);

  await progress.save();
  return progress;
};

module.exports = { updateProgressAfterQuiz };