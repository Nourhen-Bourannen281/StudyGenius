const Group = require("../models/Group");
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const { generateJaasToken } = require("../services/jaasService");
const { checkGroupBadges } = require("../services/badgeService");

// POST /api/groups — créer un groupe (le créateur devient automatiquement membre)
const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Le nom du groupe est requis" });
    }

    const group = await Group.create({
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    const newBadges = await checkGroupBadges(req.user._id);

    return res.status(201).json({ group, newBadges });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups/join — rejoindre un groupe via son code d'invitation
const joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({ message: "Code d'invitation invalide" });
    }

    // On évite les doublons si l'utilisateur est déjà membre
    if (group.members.includes(req.user._id)) {
      return res.status(409).json({ message: "Tu es déjà membre de ce groupe" });
    }

    group.members.push(req.user._id);
    await group.save();

    const newBadges = await checkGroupBadges(req.user._id);

    return res.status(200).json({ group, newBadges });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups — liste des groupes dont l'utilisateur est membre
const getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ groups });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:id — détail d'un groupe (avec la liste des membres)
const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user._id,
    })
      .populate("members", "name email")
      .populate("owner", "name email");

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    return res.status(200).json({ group });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:id/courses — cours partagés dans ce groupe
const getGroupCourses = async (req, res, next) => {
  try {
    // Sécurité : vérifie que l'utilisateur fait bien partie du groupe avant de montrer les cours
    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user._id,
    });

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    const courses = await Course.find({ group: req.params.id })
      .select("-rawContent")
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:id/leaderboard — classement des membres sur les cours du groupe
const getGroupLeaderboard = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user._id,
    }).populate("members", "name");

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    // Récupère les IDs de tous les cours partagés dans ce groupe
    const groupCourses = await Course.find({ group: req.params.id }).select("_id");
    const courseIds = groupCourses.map((c) => c._id);

    // Pour chaque membre, calcule sa moyenne de score sur ces cours précis
    const leaderboard = await Promise.all(
      group.members.map(async (member) => {
        const progresses = await Progress.find({
          user: member._id,
          course: { $in: courseIds },
        });

        const totalScore = progresses.reduce(
          (sum, p) => sum + p.overallScore,
          0
        );

        const averageScore =
          progresses.length > 0
            ? Math.round(totalScore / progresses.length)
            : 0;

        const quizzesTaken = progresses.reduce(
          (sum, p) => sum + p.quizHistory.length,
          0
        );

        return {
          userId: member._id,
          name: member.name,
          averageScore,
          quizzesTaken,
        };
      })
    );

    // Trie du meilleur score au plus faible
    leaderboard.sort((a, b) => b.averageScore - a.averageScore);

    return res.status(200).json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:id/video-token
const getVideoToken = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user._id,
    });

    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    const roomName = `studygenius-group-${group._id}`;

    const token = generateJaasToken({
      userId: req.user._id.toString(),
      userName: req.user.name,
      roomName,
    });

    return res.status(200).json({
      token,
      roomName,
      appId: process.env.JAAS_APP_ID,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupById,
  getGroupCourses,
  getGroupLeaderboard,
  getVideoToken,
};