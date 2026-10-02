import mongoose from "mongoose";
import List from "../models/List.js";
import { logActivity } from "../utils/activityLogger.js";
import {
  ensureBoardMembership,
  ensureListBoardAccess,
} from "../utils/boardAccess.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    const board = await ensureBoardMembership(boardId, req.user._id, {
      ownerOnly: true,
    });

    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: "List title is required",
      });
    }

    const newList = await List.create({
      title: trimmedTitle,
      board: board._id,
    });

    await logActivity({
      user: req.user._id,
      action: "List created",
      board: board._id,
      list: newList._id,
    });

    res.status(201).json({
      success: true,
      message: "List created successfully",
      list: newList,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while creating list",
    });
  }
};

export const getBoardLists = async (req, res) => {
  try {
    const { boardId } = req.params;
    await ensureBoardMembership(boardId, req.user._id);

    const lists = await List.find({ board: boardId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      lists,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while fetching lists",
    });
  }
};

export const getListById = async (req, res) => {
  try {
    const { id } = req.params;
    const { board } = await ensureListBoardAccess(id, req.user._id);

    const list = await List.findById(id);

    res.status(200).json({
      success: true,
      list,
      boardId: board._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while fetching list",
    });
  }
};

export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const { list, board } = await ensureListBoardAccess(id, req.user._id, {
      ownerOnly: true,
    });

    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: "List title is required",
      });
    }

    list.title = trimmedTitle;
    await list.save();

    await logActivity({
      user: req.user._id,
      action: "List updated",
      board: board._id,
      list: list._id,
    });

    res.status(200).json({
      success: true,
      message: "List updated successfully",
      list,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while updating list",
    });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const { list, board } = await ensureListBoardAccess(id, req.user._id, {
      ownerOnly: true,
    });

    await logActivity({
      user: req.user._id,
      action: "List deleted",
      board: board._id,
      list: list._id,
    });

    await list.deleteOne();

    res.status(200).json({
      success: true,
      message: "List deleted successfully",
      listId: list._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while deleting list",
    });
  }
};
