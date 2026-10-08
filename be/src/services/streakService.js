const User = require("../models/User");

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isYesterday = (date, reference) => {
  const yesterday = new Date(reference);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  if (!user.streak) {
    user.streak = { current: 0, longest: 0, lastActivityDate: null, activeDates: [] };
  }
  if (!user.streak.activeDates) {
    user.streak.activeDates = [];
  }

  const now = new Date();
  const last = user.streak.lastActivityDate;

  // Assure que le jour d'aujourd'hui est bien dans activeDates,
  // même si le streak a déjà été compté aujourd'hui (cas des comptes
  // qui avaient un streak avant l'ajout du champ activeDates)
  const alreadyLoggedToday = user.streak.activeDates.some((d) => isSameDay(new Date(d), now));
  if (!alreadyLoggedToday) {
    user.streak.activeDates.push(now);
    if (user.streak.activeDates.length > 90) {
      user.streak.activeDates = user.streak.activeDates.slice(-90);
    }
  }

  if (last && isSameDay(last, now)) {
    await user.save();
    return { streak: user.streak, isNewDay: false };
  }

  if (last && isYesterday(last, now)) {
    user.streak.current += 1;
  } else {
    user.streak.current = 1;
  }

  if (user.streak.current > user.streak.longest) {
    user.streak.longest = user.streak.current;
  }

  user.streak.lastActivityDate = now;
  await user.save();

  return { streak: user.streak, isNewDay: true };
};

module.exports = { updateStreak };