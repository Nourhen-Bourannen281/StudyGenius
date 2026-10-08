import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UploadCloud, FileText, LoaderCircle } from "lucide-react";
import { uploadCourse } from "../services/courseService";
import { getFolders } from "../services/folderService";
import { getMyGroups } from "../services/groupService";
import { useBadgeStore } from "../store/badgeStore";

const UploadPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pushBadges = useBadgeStore((state) => state.pushBadges);

  const [folders, setFolders] = useState([]);
  const [groups, setGroups] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [mode, setMode] = useState("pdf");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getFolders().then(setFolders);
    getMyGroups().then(setGroups);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject || "Général");
      if (folderId) formData.append("folder", folderId);
      if (groupId) formData.append("group", groupId);

      if (mode === "pdf") {
        if (!file) throw new Error(t("upload.dropZone"));
        formData.append("file", file);
      } else {
        if (!rawText.trim()) throw new Error(t("upload.textPlaceholder"));
        formData.append("rawText", rawText);
      }

      const result = await uploadCourse(formData);
      if (result.newBadges?.length > 0) pushBadges(result.newBadges);
      navigate(`/courses/${result.course.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">{t("upload.title")}</h1>
      <p className="text-gray-400 text-sm mb-8">{t("upload.subtitle")}</p>

      <div className="flex gap-2 mb-6 bg-surface-light p-1 rounded-xl w-fit">
        {["pdf", "text"].map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-brand-500 text-white" : "text-gray-400 hover:text-gray-200"}`}>
            {m === "pdf" ? t("upload.pdfTab") : t("upload.textTab")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder={t("upload.titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <input type="text" placeholder={t("upload.subjectPlaceholder")} value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500" />

        <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="" className="bg-surface-light">{t("upload.noFolder")}</option>
          {folders.map((f) => (
            <option key={f._id} value={f._id} className="bg-surface-light">{f.name}</option>
          ))}
        </select>

        <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="" className="bg-surface-light">{t("upload.noGroup")}</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id} className="bg-surface-light">{t("upload.shareIn")} {g.name}</option>
          ))}
        </select>

        {mode === "pdf" ? (
          <label className="border-2 border-dashed border-white/10 hover:border-brand-500/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors">
            <UploadCloud size={32} className="text-gray-500 mb-3" />
            {file ? (
              <p className="text-sm text-gray-200 flex items-center gap-2"><FileText size={16} /> {file.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-300">{t("upload.dropZone")}</p>
                <p className="text-xs text-gray-600 mt-1">{t("upload.maxSize")}</p>
              </>
            )}
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          </label>
        ) : (
          <textarea placeholder={t("upload.textPlaceholder")} value={rawText} onChange={(e) => setRawText(e.target.value)} rows={10} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
        )}

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <LoaderCircle size={18} className="animate-spin" /> : t("upload.submit")}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default UploadPage;