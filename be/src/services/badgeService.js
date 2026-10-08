const User = require("../models/User");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

const awardBadge = async (userId, badgeId) => {
  const user = await User.findById(userId);
  if (!user) return false;

  // Sécurise les anciens comptes créés avant l'ajout du champ "badges"
  if (!user.badges) {
    user.badges = [];
  }

  const alreadyHas = user.badges.some((b) => b.badgeId === badgeId);
  if (alreadyHas) return false;

  user.badges.push({ badgeId });
  await user.save();
  return true;
};

const checkCourseBadges = async (userId) => {
  const newlyEarned = [];
  const courseCount = await Course.countDocuments({ user: userId });

  if (courseCount >= 1 && (await awardBadge(userId, "first_course"))) {
    newlyEarned.push("first_course");
  }
  if (courseCount >= 5 && (await awardBadge(userId, "five_courses"))) {
    newlyEarned.push("five_courses");
  }

  return newlyEarned;
};

const checkQuizBadges = async (userId, score) => {
  const newlyEarned = [];

  if (await awardBadge(userId, "first_quiz")) {
    newlyEarned.push("first_quiz");
  }

  if (score === 100 && (await awardBadge(userId, "perfect_score"))) {
    newlyEarned.push("perfect_score");
  }

  const progresses = await Progress.find({ user: userId });
  const totalQuizzes = progresses.reduce((sum, p) => sum + p.quizHistory.length, 0);

  if (totalQuizzes >= 10 && (await awardBadge(userId, "ten_quizzes"))) {
    newlyEarned.push("ten_quizzes");
  }

  return newlyEarned;
};

const checkGroupBadges = async (userId) => {
  const newlyEarned = [];
  if (await awardBadge(userId, "group_joiner")) {
    newlyEarned.push("group_joiner");
  }
  return newlyEarned;
};

module.exports = { checkCourseBadges, checkQuizBadges, checkGroupBadges };