import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Intercepteur : ajoute automatiquement le token JWT à CHAQUE requête sortante
// Comme ça, on n'a jamais besoin d'écrire le header Authorization manuellement
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : si le serveur répond 401 (token invalide/expiré),
// on déconnecte automatiquement l'utilisateur et on le renvoie au login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;