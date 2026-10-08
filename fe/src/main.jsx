import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./i18n";
import "./index.css";
import App from "./App.jsx";
import { useThemeStore } from "./store/themeStore";

const Root = () => {
  const theme = useThemeStore((state) => state.theme);
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", i18n.language);
    document.documentElement.setAttribute("dir", i18n.language === "ar" ? "rtl" : "ltr");
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);