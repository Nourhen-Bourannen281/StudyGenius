import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, Copy, Check, Trophy, FileText, LoaderCircle, Video } from "lucide-react";
import { getGroupById, getGroupCourses, getGroupLeaderboard } from "../services/groupService";
import { getSocket } from "../services/socket";
import { useAuthStore } from "../store/authStore";
import { useCallStore } from "../store/callStore";
import { useNotificationStore } from "../store/notificationStore";
import GroupChat from "../components/GroupChat";

const GroupDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const [group, setGroup] = useState(null);
  const [courses, setCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const callStatus = useCallStore((state) => state.callStatus);
  const startCalling = useCallStore((state) => state.startCalling);

  const setActiveGroupId = useNotificationStore((state) => state.setActiveGroupId);
  const clearUnread = useNotificationStore((state) => state.clearUnread);

  useEffect(() => {
    Promise.all([getGroupById(id), getGroupCourses(id), getGroupLeaderboard(id)]).then(([g, c, l]) => {
      setGroup(g);
      setCourses(c);
      setLeaderboard(l);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    setActiveGroupId(id);
    clearUnread(id);
    return () => setActiveGroupId(null);
  }, [id]);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startCall = () => {
    const socket = getSocket();
    socket.emit("startCall", { groupId: id, groupName: group.name, callerName: user.name });
    startCalling(id, group.name);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <LoaderCircle size={18} className="animate-spin" /> {t("common.loading")}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <Users size={20} className="text-accent-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{group.name}</h1>
            <p className="text-sm text-gray-500">{group.members.length} {t("groups.membersCount")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={startCall} disabled={callStatus !== "idle"} className="flex items-center gap-2 bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
            <Video size={16} /> {t("groups.startCall")}
          </button>
          <button onClick={copyInviteCode} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-sm text-gray-300 px-3 py-2 rounded-xl transition-colors">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {group.inviteCode}
          </button>
        </div>
      </div>

      <div className="bg-surface-light border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">{t("groups.leaderboard")}</h2>
        </div>
        <div className="flex flex-col gap-2">
          {leaderboard.map((member, i) => (
            <div key={member.userId} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-400 text-black" : "bg-white/10 text-gray-400"}`}>{i + 1}</span>
                <span className="text-sm text-gray-200">{member.name}</span>
              </div>
              <div className="text-right">
                <span className="text-brand-400 font-semibold text-sm">{member.averageScore}%</span>
                <p className="text-xs text-gray-500">{member.quizzesTaken} {t("progress.quizzesTaken")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">{t("groups.sharedCourses")}</h2>
      {courses.length === 0 ? (
        <p className="text-gray-500 text-sm mb-6">{t("groups.noSharedCourses")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-surface-light border border-white/5 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
                <FileText size={20} className="text-brand-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{course.title}</h3>
              <p className="text-sm text-gray-500">{t("groups.importedBy")} {course.user?.name}</p>
            </div>
          ))}
        </div>
      )}

      <GroupChat groupId={id} />
    </motion.div>
  );
};

export default GroupDetailPage;