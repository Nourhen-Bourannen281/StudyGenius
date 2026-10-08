import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store global d'authentification, avec persistance automatique
// dans le stockage du navigateur (survit à un rechargement de page)
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => !!useAuthStore.getState().token,
    }),
    {
      name: "studygenius-auth", // clé utilisée dans le stockage
    }
  )
);