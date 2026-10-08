const BADGES = require("../config/badges");
const User = require("../models/User");

// GET /api/badges — renvoie la liste complète des badges,
// en indiquant lesquels l'utilisateur a déjà obtenus
const getMyBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("badges");

    const earnedMap = {};
    (user.badges || []).forEach((b) => {
      earnedMap[b.badgeId] = b.earnedAt;
    });

    const badgesWithStatus = BADGES.map((badge) => ({
      ...badge,
      earned: !!earnedMap[badge.id],
      earnedAt: earnedMap[badge.id] || null,
    }));

    return res.status(200).json({ badges: badgesWithStatus });
  } catch (error) {
    next(error);
  }
};
const getMyStreak = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("streak");
    return res.status(200).json({ streak: user.streak || { current: 0, longest: 0 } });
  } catch (error) {
    next(error);
  }
};
module.exports = { getMyBadges, getMyStreak };