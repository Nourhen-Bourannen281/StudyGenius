import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import { getQuizById, submitQuiz } from "../services/courseService";
import { useBadgeStore } from "../store/badgeStore";

const QuizPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [streakInfo, setStreakInfo] = useState(null);
  const pushBadges = useBadgeStore((state) => state.pushBadges);

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getQuizById(id).then(setQuiz); }, [id]);

  const selectAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formatted = Object.entries(answers).map(([questionIndex, answer]) => ({
        questionIndex: Number(questionIndex),
        answer,
      }));
      const res = await submitQuiz(id, formatted);
      if (res.newBadges?.length > 0) pushBadges(res.newBadges);
      if (res.streak) setStreakInfo(res.streak);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">{t("quiz.level")} {quiz.difficulty}</h1>
      <p className="text-gray-400 text-sm mb-8">{quiz.questions.length} {t("quiz.questions")}</p>

      {!result ? (
        <div className="flex flex-col gap-6">
          {quiz.questions.map((q, index) => (
            <div key={index} className="bg-surface-light border border-white/5 rounded-2xl p-5">
              <p className="font-medium text-white mb-4">{index + 1}. {q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options?.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(index, opt)} className={`text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${answers[index] === opt ? "bg-brand-500/15 border-brand-500 text-brand-300" : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading || Object.keys(answers).length !== quiz.questions.length} className="bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : t("quiz.submit")}
          </motion.button>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center bg-surface-light border border-white/5 rounded-2xl p-8 mb-6">
              <p className="text-gray-400 text-sm mb-1">{t("quiz.yourScore")}</p>
              <p className="text-5xl font-bold text-brand-400">{result.score}%</p>
              {streakInfo && streakInfo.current > 1 && (
                <p className="text-orange-400 text-sm mt-2">🔥 {streakInfo.current} {t("quiz.consecutiveDays")}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {result.correction.map((c, i) => (
                <div key={i} className={`rounded-xl p-4 border ${c.isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-start gap-2">
                    {c.isCorrect ? <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" /> : <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-sm text-gray-200">{c.question}</p>
                      {!c.isCorrect && (
                        <p className="text-xs text-gray-500 mt-1">{t("quiz.correctAnswer")} <span className="text-gray-300">{c.correctAnswer}</span></p>
                      )}
                      {c.explanation && <p className="text-xs text-gray-500 mt-1">{c.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default QuizPage;