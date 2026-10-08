import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Intro from "./pages/Intro";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import QuizPage from "./pages/QuizPage";
import ProgressPage from "./pages/ProgressPage";
import FoldersPage from "./pages/FoldersPage";
import FolderDetailPage from "./pages/FolderDetailPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import BadgesPage from "./pages/BadgesPage";

function App() {
const [showIntro, setShowIntro] = useState(() => {
  return !sessionStorage.getItem("studygenius_intro_shown");
});
  if (showIntro) {
  return (
    <Intro
      onFinish={() => {
        sessionStorage.setItem("studygenius_intro_shown", "true");
        setShowIntro(false);
      }}
    />
  );
}

  return (
    <Routes>
      {/* --- Pages publiques --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- Pages protégées, avec sidebar --- */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/quizzes/:id" element={<QuizPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/folders" element={<FoldersPage />} />
        <Route path="/folders/:id" element={<FolderDetailPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />
        <Route path="/badges" element={<BadgesPage />} />
      </Route>

      {/* --- Redirection par défaut --- */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
