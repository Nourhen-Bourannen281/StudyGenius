import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, Plus, X, LoaderCircle, LogIn, Search } from "lucide-react";
import { getMyGroups, createGroup, joinGroup } from "../services/groupService";
import { useNotificationStore } from "../store/notificationStore";
import { useBadgeStore } from "../store/badgeStore";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const GroupsPage = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const unreadByGroup = useNotificationStore((state) => state.unreadByGroup);
  const pushBadges = useBadgeStore((state) => state.pushBadges);

  const loadGroups = () => {
    getMyGroups().then(setGroups).finally(() => setLoading(false));
  };

  useEffect(() => { loadGroups(); }, []);

  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await createGroup(name);
      if (result.newBadges?.length > 0) pushBadges(result.newBadges);
      setName("");
      setShowCreateModal(false);
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await joinGroup(inviteCode);
      if (result.newBadges?.length > 0) pushBadges(result.newBadges);
      setInviteCode("");
      setShowJoinModal(false);
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("groups.title")}</h1>
          <p className="text-gray-400 text-sm mt-1">{t("groups.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowJoinModal(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-200 font-medium px-4 py-2.5 rounded-xl transition-colors">
            <LogIn size={18} /> {t("groups.join")}
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white font-medium px-4 py-2.5 rounded-xl">
            <Plus size={18} /> {t("groups.create")}
          </motion.button>
        </div>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder={t("groups.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400">
          <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-surface-light rounded-2xl border border-white/5">
          <Users size={40} className="text-gray-600 mb-4" />
          <p className="text-gray-300 font-medium">{t("groups.noGroups")}</p>
          <p className="text-gray-500 text-sm mt-1">{t("groups.noGroupsSubtitle")}</p>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <motion.div key={group._id} variants={item}>
            <Link to={`/groups/${group._id}`}>
              <motion.div whileHover={{ y: -4 }} className="relative bg-surface-light border border-white/5 hover:border-brand-500/30 rounded-2xl p-5 transition-colors">
                {unreadByGroup[group._id] > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadByGroup[group._id] > 9 ? "9+" : unreadByGroup[group._id]}
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center mb-4">
                  <Users size={20} className="text-accent-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{group.name}</h3>
                <p className="text-sm text-gray-500">{group.members.length} {t("groups.membersCount")}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showCreateModal && (
          <Modal onClose={() => setShowCreateModal(false)} title={t("groups.create")}>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <input type="text" placeholder={t("groups.groupName")} value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <SubmitButton saving={saving} label={t("folders.createFolder")} />
            </form>
          </Modal>
        )}

        {showJoinModal && (
          <Modal onClose={() => setShowJoinModal(false)} title={t("groups.join")}>
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <input type="text" placeholder={t("groups.inviteCode")} value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <SubmitButton saving={saving} label={t("groups.join")} />
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ onClose, title, children }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-surface-light border border-white/10 rounded-2xl p-6 w-full max-w-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

const SubmitButton = ({ saving, label }) => (
  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving} className="bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
    {saving ? <LoaderCircle size={18} className="animate-spin" /> : label}
  </motion.button>
);

export default GroupsPage;