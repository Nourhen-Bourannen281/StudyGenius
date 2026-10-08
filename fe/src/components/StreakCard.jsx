import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { getMyStreak } from "../services/badgeService";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

// Génère les 7 jours de la semaine calendaire EN COURS, de lundi à dimanche
const getCurrentWeekDays = () => {
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // 0 = lundi, ..., 6 = dimanche
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayIndex);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const StreakCard = () => {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    getMyStreak().then(setStreak);
  }, []);

  if (!streak) return null;

  const isActive = streak.current > 0;
  const activeDates = (streak.activeDates || []).map((d) => new Date(d));
  const weekDays = getCurrentWeekDays();
  const today = new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-light border border-white/5 rounded-2xl p-5"
    >
      <div className="flex items-center gap-4 mb-5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isActive ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-white/5"
          }`}
        >
          <Flame size={22} className={isActive ? "text-white" : "text-gray-500"} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">
            {streak.current} <span className="text-sm font-normal text-gray-500">jour(s)</span>
          </p>
          <p className="text-xs text-gray-500">
            Record : {streak.longest} jour(s) consécutif(s)
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        {weekDays.map((day, i) => {
          const wasActive = activeDates.some((d) => isSameDay(d, day));
          const isToday = isSameDay(day, today);

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-gray-500 uppercase">{DAYS[i]}</span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                  wasActive
                    ? "bg-gradient-to-br from-orange-500 to-red-500"
                    : isToday
                    ? "bg-white/10 border border-white/20"
                    : "bg-white/5"
                }`}
              >
                {wasActive ? "🔥" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StreakCard;