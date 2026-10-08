import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, Plus, FileText, LoaderCircle, Trash2, Search } from "lucide-react";
import { getCourses, deleteCourse } from "../services/courseService";
import { useAuthStore } from "../store/authStore";
import StreakCard from "../components/StreakCard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const DashboardPage = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCourses = () => {
    getCourses().then(setCourses).finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("common.confirm") + " ?")) return;
    await deleteCourse(id);
    loadCourses();
  };

  const filteredCourses = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.title.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("dashboard.greeting")} {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <Link to="/upload">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white font-medium px-4 py-2.5 rounded-xl">
            <Plus size={18} />
            {t("dashboard.newCourse")}
          </motion.button>
        </Link>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder={t("dashboard.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="mb-8">
        <StreakCard />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400">
          <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-24 bg-surface-light rounded-2xl border border-white/5">
          <BookOpen size={40} className="text-gray-600 mb-4" />
          <p className="text-gray-300 font-medium">{t("dashboard.noCourses")}</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">{t("dashboard.noCoursesSubtitle")}</p>
          <Link to="/upload">
            <button className="bg-brand-500/15 text-brand-400 font-medium px-4 py-2 rounded-xl hover:bg-brand-500/25 transition-colors">
              {t("dashboard.importCourse")}
            </button>
          </Link>
        </motion.div>
      )}

      {!loading && courses.length > 0 && filteredCourses.length === 0 && (
        <p className="text-gray-500 text-sm">{t("dashboard.noResults")} "{search}".</p>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <motion.div key={course._id} variants={item}>
            <Link to={`/courses/${course._id}`}>
              <motion.div whileHover={{ y: -4 }} className="group relative bg-surface-light border border-white/5 hover:border-brand-500/30 rounded-2xl p-5 transition-colors cursor-pointer h-full">
                <button onClick={(e) => handleDelete(course._id, e)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity">
                  <Trash2 size={16} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
                  <FileText size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.subject}</p>
                <p className="text-xs text-gray-600 mt-3">{new Date(course.importedAt).toLocaleDateString()}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardPage;