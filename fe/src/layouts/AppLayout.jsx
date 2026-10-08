import { useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Upload,
  TrendingUp,
  LogOut,
  Sparkles,
  Folder,
  Users,
  Phone,
  PhoneOff,
  Sun,
  Moon,
  Award,
  Languages,
} from "lucide-react";

import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { useCallStore } from "../store/callStore";
import { useThemeStore } from "../store/themeStore";

import { getSocket } from "../services/socket";
import { getMyGroups } from "../services/groupService";

import VideoRoom from "../components/VideoRoom";
import BadgeToast from "../components/BadgeToast";

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const unreadByGroup = useNotificationStore((state) => state.unreadByGroup);
  const addUnread = useNotificationStore((state) => state.addUnread);

  const totalUnread = Object.values(unreadByGroup).reduce((sum, n) => sum + n, 0);

  const callStatus = useCallStore((state) => state.callStatus);
  const incomingCall = useCallStore((state) => state.incomingCall);
  const activeCallGroupId = useCallStore((state) => state.activeGroupId);
  const activeCallGroupName = useCallStore((state) => state.activeGroupName);
  const receiveIncomingCall = useCallStore((state) => state.receiveIncomingCall);
  const clearIncomingCall = useCallStore((state) => state.clearIncomingCall);
  const joinCall = useCallStore((state) => state.joinCall);
  const endCall = useCallStore((state) => state.endCall);

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getNavItems = (t) => [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/folders", label: t("nav.folders"), icon: Folder },
    { to: "/groups", label: t("nav.groups"), icon: Users },
    { to: "/badges", label: t("nav.badges"), icon: Award },
    { to: "/upload", label: t("nav.upload"), icon: Upload },
    { to: "/progress", label: t("nav.progress"), icon: TrendingUp },
  ];

  const navItems = getNavItems(t);

  useEffect(() => {
    const socket = getSocket();

    getMyGroups().then((groups) => {
      groups.forEach((g) => {
        socket.emit("joinGroup", g._id);
      });
    });

    const handleNewMessage = (message) => {
      addUnread(message.group);
    };

    const handleIncomingCall = (data) => {
      receiveIncomingCall(data);
    };

    const handleCallAccepted = (data) => {
      joinCall(data.groupId, data.groupName);
    };

    const handleCallDeclined = (data) => {
      const state = useCallStore.getState();

      if (state.callStatus === "calling" && state.activeGroupId === data.groupId) {
        endCall();
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callDeclined", handleCallDeclined);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callDeclined", handleCallDeclined);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const acceptCall = () => {
    const socket = getSocket();

    socket.emit("acceptCall", {
      groupId: incomingCall.groupId,
      groupName: incomingCall.groupName,
    });

    joinCall(incomingCall.groupId, incomingCall.groupName);
  };

  const declineCall = () => {
    const socket = getSocket();

    socket.emit("declineCall", {
      groupId: incomingCall.groupId,
    });

    clearIncomingCall();
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-64 bg-surface-light border-r border-white/5 flex flex-col p-5">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">StudyGenius</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/15 text-brand-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`
              }
            >
              <Icon size={18} />
              {label}

              {to === "/groups" && totalUnread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 pt-4 mt-4">
          {/* Sélecteur de langue */}
          <div className="flex gap-1 mb-2">
            {["fr", "en", "ar"].map((lng) => (
              <button
                key={lng}
                onClick={() => changeLanguage(lng)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  i18n.language === lng
                    ? "bg-brand-500/15 text-brand-400"
                    : "text-gray-500 hover:bg-white/5"
                }`}
              >
                {lng.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors w-full mb-1"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
          </button>

          <p className="text-sm text-gray-300 px-2 mb-2 truncate">{user?.name}</p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={18} />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 p-8 overflow-y-auto"
      >
        <Outlet />
      </motion.main>

      <AnimatePresence>
        {callStatus === "calling" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <div className="bg-surface-light border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4">
              <Phone size={28} className="text-brand-400" />
              <p className="text-white font-medium">{t("call.calling")}</p>
              <p className="text-gray-500 text-sm">{activeCallGroupName}</p>

              <button
                onClick={endCall}
                className="flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-medium px-4 py-2 rounded-xl"
              >
                <PhoneOff size={16} />
                {t("call.cancel")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-surface-light border border-white/10 rounded-2xl p-5 shadow-2xl z-50 w-72"
          >
            <p className="text-white font-medium mb-1">📞 {t("call.incoming")}</p>
            <p className="text-gray-400 text-sm mb-4">
              {incomingCall.callerName} {t("call.isCalling")} — {incomingCall.groupName}
            </p>

            <div className="flex gap-2">
              <button
                onClick={acceptCall}
                className="flex-1 bg-emerald-500/15 text-emerald-400 py-2 rounded-xl"
              >
                <Phone size={16} />
                {t("call.accept")}
              </button>

              <button
                onClick={declineCall}
                className="flex-1 bg-red-500/15 text-red-400 py-2 rounded-xl"
              >
                <PhoneOff size={16} />
                {t("call.decline")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {callStatus === "in-call" && (
        <VideoRoom
          groupId={activeCallGroupId}
          groupName={activeCallGroupName}
          userName={user?.name}
          onClose={endCall}
        />
      )}

      <BadgeToast />
    </div>
  );
};

export default AppLayout;