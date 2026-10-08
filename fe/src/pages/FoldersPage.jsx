import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Folder, Plus, X, LoaderCircle, Trash2, Pencil, Search } from "lucide-react";
import { getFolders, createFolder, updateFolder, deleteFolder } from "../services/folderService";

const COLORS = ["#5b6ef5", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const FoldersPage = () => {
  const { t } = useTranslation();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const loadFolders = () => {
    getFolders().then(setFolders).finally(() => setLoading(false));
  };

  useEffect(() => { loadFolders(); }, []);

  const filteredFolders = folders.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase()));

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setColor(COLORS[0]);
    setShowModal(true);
  };

  const openEditModal = (folder, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(folder._id);
    setName(folder.name);
    setColor(folder.color);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await updateFolder(editingId, { name, color });
      else await createFolder({ name, color });
      setShowModal(false);
      loadFolders();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("common.confirm") + " ?")) return;
    await deleteFolder(id);
    loadFolders();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("folders.title")}</h1>
          <p className="text-gray-400 text-sm mt-1">{t("folders.subtitle")}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreateModal} className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white font-medium px-4 py-2.5 rounded-xl">
          <Plus size={18} />
          {t("folders.newFolder")}
        </motion.button>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder={t("folders.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400">
          <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
        </div>
      )}

      {!loading && folders.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-surface-light rounded-2xl border border-white/5">
          <Folder size={40} className="text-gray-600 mb-4" />
          <p className="text-gray-300 font-medium">{t("folders.noFolders")}</p>
          <p className="text-gray-500 text-sm mt-1">{t("folders.noFoldersSubtitle")}</p>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFolders.map((folder) => (
          <motion.div key={folder._id} variants={item}>
            <Link to={`/folders/${folder._id}`}>
              <motion.div whileHover={{ y: -4 }} className="group relative bg-surface-light border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-colors cursor-pointer">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditModal(folder, e)} className="text-gray-500 hover:text-brand-400 p-1"><Pencil size={15} /></button>
                  <button onClick={(e) => handleDelete(folder._id, e)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={15} /></button>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${folder.color}22` }}>
                  <Folder size={20} style={{ color: folder.color }} />
                </div>
                <h3 className="font-semibold text-white mb-1">{folder.name}</h3>
                <p className="text-sm text-gray-500">{folder.courseCount} {t("folders.coursesCount")}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-surface-light border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">{editingId ? t("folders.editFolder") : t("folders.newFolder")}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <input type="text" placeholder={t("folders.folderName")} value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button type="button" key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-transform ${color === c ? "scale-110 ring-2 ring-white/50 ring-offset-2 ring-offset-surface-light" : ""}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving} className="bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <LoaderCircle size={18} className="animate-spin" /> : editingId ? t("common.save") : t("folders.createFolder")}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoldersPage;