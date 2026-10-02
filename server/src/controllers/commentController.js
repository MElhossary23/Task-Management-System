import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { ensureBoardMembership } from "../utils/boardAccess.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getTaskAccess = async (taskId, userId) => {
  if (!isValidObjectId(taskId)) {
    const error = new Error("Invalid task id");
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findById(taskId).populate("list");

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const board = await ensureBoardMembership(task.list.board.toString(), userId);

  return { task, board, list: task.list };
};

export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const trimmedContent = content?.trim();

    if (!trimmedContent) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const { task, board } = await getTaskAccess(taskId, req.user._id);

    const comment = await Comment.create({
      content: trimmedContent,
      user: req.user._id,
      task: task._id,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email",
    );

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: populatedComment,
      boardId: board._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while creating comment",
    });
  }
};

export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { task, board } = await getTaskAccess(taskId, req.user._id);

    const comments = await Comment.find({ task: task._id })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      comments,
      boardId: board._id,
      taskId: task._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while fetching comments",
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own comments",
      });
    }

    const trimmedContent = content?.trim();
    if (!trimmedContent) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    await getTaskAccess(comment.task.toString(), req.user._id);

    comment.content = trimmedContent;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name email",
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while updating comment",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    await getTaskAccess(comment.task.toString(), req.user._id);
    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      commentId: comment._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while deleting comment",
    });
  }
};
