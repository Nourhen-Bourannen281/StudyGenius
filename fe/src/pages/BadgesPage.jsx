import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, Library, HelpCircle, Trophy, Target, Users, LoaderCircle, Lock } from "lucide-react";
import { getMyBadges } from "../services/badgeService";

const ICONS = { BookOpen, Library, HelpCircle, Trophy, Target, Users };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const BadgesPage = () => {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBadges().then(setBadges).finally(() => setLoading(false));
  }, []);

  const earnedCount = badges.filter((b) => b.earned).length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t("badges.title")}</h1>
        <p className="text-gray-400 text-sm mt-1">{earnedCount} / {badges.length} {t("badges.unlocked")}</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon] || Trophy;
          return (
            <motion.div key={badge.id} variants={item} className={`rounded-2xl p-5 border ${badge.earned ? "bg-surface-light border-brand-500/30" : "bg-surface-light border-white/5 opacity-50"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${badge.earned ? "bg-gradient-to-br from-brand-500 to-accent-500" : "bg-white/5"}`}>
                {badge.earned ? <Icon size={22} className="text-white" /> : <Lock size={20} className="text-gray-500" />}
              </div>
              <h3 className="font-semibold text-white mb-1">{badge.name}</h3>
              <p className="text-sm text-gray-500">{badge.description}</p>
              {badge.earned && badge.earnedAt && (
                <p className="text-xs text-brand-400 mt-3">{t("badges.unlockedOn")} {new Date(badge.earnedAt).toLocaleDateString()}</p>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BadgesPage;