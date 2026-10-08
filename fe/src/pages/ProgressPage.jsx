import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, LoaderCircle } from "lucide-react";
import { getOverallProgress } from "../services/courseService";

const ProgressPage = () => {
  const { t } = useTranslation();
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverallProgress().then(setProgressList).finally(() => setLoading(false));
  }, []);

  const chartData = progressList.map((p) => ({
    name: p.course?.title?.slice(0, 15) || "Cours",
    score: p.overallScore,
  }));

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
          <TrendingUp size={20} className="text-accent-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{t("progress.title")}</h1>
          <p className="text-sm text-gray-500">{t("progress.subtitle")}</p>
        </div>
      </div>

      {progressList.length === 0 ? (
        <div className="text-center py-24 bg-surface-light rounded-2xl border border-white/5">
          <p className="text-gray-400">{t("progress.noData")}</p>
        </div>
      ) : (
        <>
          <div className="bg-surface-light border border-white/5 rounded-2xl p-6 mb-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                <XAxis dataKey="name" stroke="#8b8fa3" fontSize={12} />
                <YAxis stroke="#8b8fa3" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#171a24", border: "1px solid #2a2e3d", borderRadius: 12 }} labelStyle={{ color: "#e5e7eb" }} />
                <Bar dataKey="score" fill="#5b6ef5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-3">
            {progressList.map((p) => (
              <div key={p._id} className="flex items-center justify-between bg-surface-light border border-white/5 rounded-xl p-4">
                <div>
                  <p className="font-medium text-white text-sm">{p.course?.title}</p>
                  <p className="text-xs text-gray-500">{p.quizHistory.length} {t("progress.quizzesTaken")}</p>
                </div>
                <span className="text-brand-400 font-semibold">{p.overallScore}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ProgressPage;