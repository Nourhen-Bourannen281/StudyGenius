const Message = require("../models/Message");
const Group = require("../models/Group");

// GET /api/groups/:id/messages — récupère l'historique des messages d'un groupe
const getGroupMessages = async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    const messages = await Message.find({ group: req.params.id })
      .populate("sender", "name")
      .sort({ createdAt: 1 }); // ordre chronologique, du plus ancien au plus récent

    return res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGroupMessages };