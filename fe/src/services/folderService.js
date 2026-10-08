import api from "./api";

export const getFolders = async () => {
  const response = await api.get("/folders");
  return response.data.folders;
};

export const createFolder = async (data) => {
  const response = await api.post("/folders", data);
  return response.data.folder;
};

export const getCoursesInFolder = async (folderId) => {
  const response = await api.get(`/folders/${folderId}/courses`);
  return response.data.courses;
};

export const deleteFolder = async (folderId) => {
  const response = await api.delete(`/folders/${folderId}`);
  return response.data;
};

export const updateFolder = async (id, data) => {
  const response = await api.put(`/folders/${id}`, data);
  return response.data.folder;
};