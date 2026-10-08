import api from "./api";

export const getCourses = async () => {
  const response = await api.get("/courses");
  return response.data.courses;
};

export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data.course;
};

export const uploadCourse = async (formData) => {
  const response = await api.post("/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data; // { message, course, newBadges }
};

export const generateSummary = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/summary`);
  return response.data.summary;
};

export const generateQuiz = async (courseId, difficulty) => {
  const response = await api.post(`/courses/${courseId}/quiz`, { difficulty });
  return response.data.quiz;
};

export const getQuizById = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data.quiz;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return response.data;
};

export const generatePredictions = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/predictions`);
  return response.data.prediction;
};

export const getOverallProgress = async () => {
  const response = await api.get("/progress");
  return response.data.progressList;
};
export const updateCourse = async (id, data) => {
  const response = await api.put(`/courses/${id}`, data);
  return response.data.course;
};

export const deleteCourse = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

export const downloadSummaryPDF = async (courseId, courseTitle) => {
  const response = await api.get(`/courses/${courseId}/summary/pdf`, {
    responseType: "blob", // important : on attend des données binaires, pas du JSON
  });

  // Crée un lien de téléchargement temporaire et le déclenche automatiquement
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `resume-${courseTitle}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};