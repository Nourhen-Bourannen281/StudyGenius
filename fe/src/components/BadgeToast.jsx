import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, BookOpen, Library, HelpCircle, Target, Users } from "lucide-react";
import { useBadgeStore } from "../store/badgeStore";

const ICONS = { BookOpen, Library, HelpCircle, Trophy, Target, Users };

const BADGE_INFO = {
  first_course: { name: "Premier pas", icon: "BookOpen" },
  five_courses: { name: "Collectionneur", icon: "Library" },
  first_quiz: { name: "Premier quiz", icon: "HelpCircle" },
  perfect_score: { name: "Score parfait", icon: "Trophy" },
  ten_quizzes: { name: "Assidu", icon: "Target" },
  group_joiner: { name: "Esprit d'équipe", icon: "Users" },
};

const BadgeToast = () => {
  const queue = useBadgeStore((state) => state.queue);
  const shiftBadge = useBadgeStore((state) => state.shiftBadge);

  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => shiftBadge(), 3500);
    return () => clearTimeout(timer);
  }, [current]);

  if (!current) return null;

  const info = BADGE_INFO[current] || { name: current, icon: "Trophy" };
  const Icon = ICONS[info.icon] || Trophy;

  return (
    <AnimatePresence>
      <motion.div
        key={current}
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -20, x: "-50%" }}
        className="fixed top-6 left-1/2 z-[60] bg-surface-light border border-brand-500/30 rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-brand-400 font-medium">Succès débloqué !</p>
          <p className="text-sm text-white font-semibold">{info.name}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeToast;