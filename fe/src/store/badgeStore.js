import { create } from "zustand";

// Gère la file d'attente des badges venant d'être débloqués,
// pour afficher un toast même si plusieurs sont gagnés d'un coup
export const useBadgeStore = create((set) => ({
  queue: [], // liste des IDs de badges à afficher

  pushBadges: (badgeIds) =>
    set((state) => ({ queue: [...state.queue, ...badgeIds] })),

  shiftBadge: () =>
    set((state) => ({ queue: state.queue.slice(1) })),
}));