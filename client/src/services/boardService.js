import api from "./api";

export const getBoards = async () => {
  return api.get("/boards");
};

export const getBoard = async (boardId) => {
  return api.get(`/boards/${boardId}`);
};

export const createBoard = async (data) => {
  return api.post("/boards", data);
};

export const updateBoard = async (boardId, data) => {
  return api.put(`/boards/${boardId}`, data);
};

export const deleteBoard = async (boardId) => {
  return api.delete(`/boards/${boardId}`);
};

export const getBoardMembers = async (boardId) => {
  return api.get(`/boards/${boardId}/members`);
};

export const addBoardMember = async (boardId, data) => {
  return api.post(`/boards/${boardId}/members`, data);
};

export const removeBoardMember = async (boardId, memberId) => {
  return api.delete(`/boards/${boardId}/members/${memberId}`);
};

export const getBoardLists = async (boardId) => {
  return api.get(`/boards/${boardId}/lists`);
};

export const getBoardActivity = async (boardId) => {
  return api.get(`/boards/${boardId}/activity`);
};

export const createList = async (boardId, data) => {
  return api.post(`/boards/${boardId}/lists`, data);
};

export const getList = async (listId) => {
  return api.get(`/lists/${listId}`);
};

export const updateList = async (listId, data) => {
  return api.put(`/lists/${listId}`, data);
};

export const deleteList = async (listId) => {
  return api.delete(`/lists/${listId}`);
};
