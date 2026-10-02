import api from "./api";

export const getUsers = async () => {
  return api.get("/users");
};

export const getTasksByList = async (listId, params = {}) => {
  return api.get(`/lists/${listId}/tasks`, { params });
};

export const getTask = async (taskId) => {
  return api.get(`/tasks/${taskId}`);
};

export const createTask = async (listId, data) => {
  return api.post(`/lists/${listId}/tasks`, data);
};

export const updateTask = async (taskId, data) => {
  return api.put(`/tasks/${taskId}`, data);
};

export const deleteTask = async (taskId) => {
  return api.delete(`/tasks/${taskId}`);
};

export const getCommentsByTask = async (taskId) => {
  return api.get(`/tasks/${taskId}/comments`);
};

export const createComment = async (taskId, data) => {
  return api.post(`/tasks/${taskId}/comments`, data);
};

export const updateComment = async (commentId, data) => {
  return api.put(`/comments/${commentId}`, data);
};

export const deleteComment = async (commentId) => {
  return api.delete(`/comments/${commentId}`);
};
