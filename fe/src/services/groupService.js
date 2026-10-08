import api from "./api";

export const createGroup = async (name) => {
  const response = await api.post("/groups", { name });
  return response.data.group;
};

export const joinGroup = async (inviteCode) => {
  const response = await api.post("/groups/join", { inviteCode });
  return response.data.group;
};

export const getMyGroups = async () => {
  const response = await api.get("/groups");
  return response.data.groups;
};

export const getGroupById = async (id) => {
  const response = await api.get(`/groups/${id}`);
  return response.data.group;
};

export const getGroupCourses = async (id) => {
  const response = await api.get(`/groups/${id}/courses`);
  return response.data.courses;
};

export const getGroupLeaderboard = async (id) => {
  const response = await api.get(`/groups/${id}/leaderboard`);
  return response.data.leaderboard;
};
export const getGroupMessages = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/messages`);
  return response.data.messages;
};

export const getVideoToken = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/video-token`);
  return response.data;
};