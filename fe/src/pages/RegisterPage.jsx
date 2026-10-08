import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, User, Mail, Lock, LoaderCircle } from "lucide-react";
import { registerUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    studyLevel: "autre",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await registerUser(form);
      login(user, token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden px-4">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-accent-500/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "-15%", right: "-10%" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md bg-surface-light border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
            <Sparkles size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t("auth.createAccount")}</h1>
          <p className="text-gray-400 text-sm mt-1">{t("auth.registerSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder={t("auth.fullName")}
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder={t("auth.email")}
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              name="password"
              placeholder={t("auth.passwordMin")}
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <select
            name="studyLevel"
            value={form.studyLevel}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
            <option value="lycee" className="bg-surface-light">{t("auth.studyLevel.lycee")}</option>
            <option value="licence" className="bg-surface-light">{t("auth.studyLevel.licence")}</option>
            <option value="master" className="bg-surface-light">{t("auth.studyLevel.master")}</option>
            <option value="autre" className="bg-surface-light">{t("auth.studyLevel.autre")}</option>
          </select>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : t("auth.register")}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            {t("auth.signIn")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;