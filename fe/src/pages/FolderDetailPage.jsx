import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FileText, LoaderCircle, ArrowLeft } from "lucide-react";
import { getCoursesInFolder } from "../services/folderService";

const FolderDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoursesInFolder(id).then(setCourses).finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <Link to="/folders" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-6">
        <ArrowLeft size={16} /> {t("folders.backToFolders")}
      </Link>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-surface-light rounded-2xl border border-white/5">
          <p className="text-gray-400">{t("folders.emptyFolder")}</p>
        </div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <motion.div key={course._id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <Link to={`/courses/${course._id}`}>
                <motion.div whileHover={{ y: -4 }} className="bg-surface-light border border-white/5 hover:border-brand-500/30 rounded-2xl p-5 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
                    <FileText size={20} className="text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.subject}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FolderDetailPage;