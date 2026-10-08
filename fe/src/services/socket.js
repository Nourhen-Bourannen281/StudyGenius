import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

let socket = null;

// Crée (ou réutilise) une connexion Socket.IO authentifiée avec le token JWT
export const getSocket = () => {
  // On réutilise l'instance existante dès qu'elle existe,
  // même si la connexion n'est pas encore totalement établie —
  // Socket.IO met les émissions en attente automatiquement le temps de se connecter
  if (socket) return socket;

  const token = useAuthStore.getState().token;

  socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
    auth: { token },
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};