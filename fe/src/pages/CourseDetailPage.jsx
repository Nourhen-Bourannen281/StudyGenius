import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FileText, Sparkles, HelpCircle, Target, LoaderCircle, Pencil, Trash2, X, Download } from "lucide-react";
import {
  getCourseById, generateSummary, generateQuiz, generatePredictions,
  updateCourse, deleteCourse, downloadSummaryPDF,
} from "../services/courseService";

const CourseDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    getCourseById(id).then((c) => {
      setCourse(c);
      setEditTitle(c.title);
      setEditSubject(c.subject);
    });
  }, [id]);

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      setSummary(await generateSummary(id));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoadingAction("quiz");
    try {
      const quiz = await generateQuiz(id, "moyen");
      navigate(`/quizzes/${quiz._id}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGeneratePredictions = async () => {
    setLoadingAction("predictions");
    try {
      setPredictions(await generatePredictions(id));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const updated = await updateCourse(id, { title: editTitle, subject: editSubject });
      setCourse({ ...course, ...updated });
      setShowEditModal(false);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("common.confirm") + " ?")) return;
    await deleteCourse(id);
    navigate("/dashboard");
  };

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      await downloadSummaryPDF(id, course.title);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!course) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
            <FileText size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{course.title}</h1>
            <p className="text-sm text-gray-500">{course.subject}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-brand-400 hover:bg-white/10 transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={handleDelete} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mt-4 mb-8 line-clamp-3">{course.rawContent?.slice(0, 250)}...</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <ActionButton icon={Sparkles} label={t("course.generateSummary")} loading={loadingAction === "summary"} onClick={handleGenerateSummary} />
        <ActionButton icon={HelpCircle} label={t("course.generateQuiz")} loading={loadingAction === "quiz"} onClick={handleGenerateQuiz} />
        <ActionButton icon={Target} label={t("course.generatePredictions")} loading={loadingAction === "predictions"} onClick={handleGeneratePredictions} />
      </div>

      <AnimatePresence>
        {summary && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-light border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{t("course.summaryTitle")}</h2>
              <button onClick={handleDownloadPDF} disabled={downloadingPdf} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-sm text-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {downloadingPdf ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />}
                {t("course.pdf")}
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {summary.sections?.map((s, i) => (
                <div key={i}>
                  <h3 className="font-medium text-brand-400 mb-1">{s.heading}</h3>
                  <p className="text-sm text-gray-300">{s.content}</p>
                </div>
              ))}
            </div>
            {summary.keyPoints?.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/5">
                <p className="text-sm font-medium text-gray-300 mb-2">{t("course.keyPoints")}</p>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                  {summary.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {predictions && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-light border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{t("course.predictionsTitle")}</h2>
            <div className="flex flex-col gap-4">
              {predictions.predictedQuestions?.map((p, i) => (
                <div key={i} className="border-l-2 border-accent-500 pl-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white text-sm">{p.concept}</p>
                    <span className="text-xs bg-accent-500/15 text-accent-400 px-2 py-0.5 rounded-full">{p.probability}%</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{p.question}</p>
                  <p className="text-xs text-gray-500 mt-1">{p.justification}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-surface-light border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">{t("common.edit")}</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-300"><X size={20} /></button>
              </div>
              <form onSubmit={handleEdit} className="flex flex-col gap-4">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <input type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={savingEdit} className="bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                  {savingEdit ? <LoaderCircle size={18} className="animate-spin" /> : t("common.save")}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ActionButton = ({ icon: Icon, label, loading, onClick }) => (
  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick} disabled={loading} className="flex flex-col items-center gap-2 bg-surface-light border border-white/5 hover:border-brand-500/30 rounded-2xl p-5 transition-colors disabled:opacity-60">
    {loading ? <LoaderCircle size={22} className="animate-spin text-brand-400" /> : <Icon size={22} className="text-brand-400" />}
    <span className="text-sm font-medium text-gray-200">{label}</span>
  </motion.button>
);

export default CourseDetailPage;