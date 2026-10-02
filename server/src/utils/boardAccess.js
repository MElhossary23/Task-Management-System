import mongoose from "mongoose";
import Board from "../models/Board.js";
import List from "../models/List.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const memberMatchesUser = (member, userId) => {
  const memberId = member?._id ? member._id : member;
  return memberId?.toString() === userId.toString();
};

export const isBoardMember = (board, userId) => {
  if (!board || !userId) return false;

  const ownerId = board.owner?._id ? board.owner._id : board.owner;
  if (ownerId?.toString() === userId.toString()) {
    return true;
  }

  return (board.members || []).some((member) =>
    memberMatchesUser(member, userId),
  );
};

export const isBoardOwner = (board, userId) => {
  if (!board || !userId) return false;
  const ownerId = board.owner?._id ? board.owner._id : board.owner;
  return ownerId?.toString() === userId.toString();
};

export const isTaskAssignedToUser = (task, userId) => {
  if (!task || !userId) return false;

  const assignedUserId = task.assignedTo?._id
    ? task.assignedTo._id.toString()
    : task.assignedTo?.toString();

  return assignedUserId === userId.toString();
};

export const ensureBoardMembership = async (boardId, userId, options = {}) => {
  const { ownerOnly = false } = options;

  if (!isValidObjectId(boardId)) {
    const error = new Error("Invalid board id");
    error.statusCode = 400;
    throw error;
  }

  const board = await Board.findById(boardId)
    .populate("owner", "name email")
    .populate("members", "name email");

  if (!board) {
    const error = new Error("Board not found");
    error.statusCode = 404;
    throw error;
  }

  const isMember = isBoardMember(board, userId);
  const isOwner = isBoardOwner(board, userId);

  if (!isMember || (ownerOnly && !isOwner)) {
    const error = new Error(
      ownerOnly
        ? "You are not allowed to manage this board"
        : "You are not allowed to access this board",
    );
    error.statusCode = 403;
    throw error;
  }

  return board;
};

export const ensureListBoardAccess = async (listId, userId, options = {}) => {
  const { ownerOnly = false } = options;

  if (!isValidObjectId(listId)) {
    const error = new Error("Invalid list id");
    error.statusCode = 400;
    throw error;
  }

  const list = await List.findById(listId);
  if (!list) {
    const error = new Error("List not found");
    error.statusCode = 404;
    throw error;
  }

  const board = await ensureBoardMembership(list.board.toString(), userId, {
    ownerOnly,
  });

  return { list, board };
};
