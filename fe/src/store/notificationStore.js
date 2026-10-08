import { create } from "zustand";

export const useNotificationStore = create((set, get) => ({
  unreadByGroup: {},
  activeGroupId: null,

  setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),

  addUnread: (groupId) => {
    if (get().activeGroupId === groupId) return;
    set((state) => ({
      unreadByGroup: {
        ...state.unreadByGroup,
        [groupId]: (state.unreadByGroup[groupId] || 0) + 1,
      },
    }));
  },

  clearUnread: (groupId) => {
    set((state) => {
      const updated = { ...state.unreadByGroup };
      delete updated[groupId];
      return { unreadByGroup: updated };
    });
  },
}));