import { create } from "zustand";

export const useCallStore = create((set) => ({
  callStatus: "idle",
  incomingCall: null,
  activeGroupId: null,
  activeGroupName: null,

  startCalling: (groupId, groupName) =>
    set({ callStatus: "calling", activeGroupId: groupId, activeGroupName: groupName }),

  receiveIncomingCall: (data) => set({ incomingCall: data }),

  clearIncomingCall: () => set({ incomingCall: null }),

  joinCall: (groupId, groupName) =>
    set({ callStatus: "in-call", activeGroupId: groupId, activeGroupName: groupName, incomingCall: null }),

  endCall: () => set({ callStatus: "idle", activeGroupId: null, activeGroupName: null }),
}));