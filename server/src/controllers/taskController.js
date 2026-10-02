import mongoose from "mongoose";
import Board from "../models/Board.js";
import List from "../models/List.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";
import {
  ensureBoardMembership,
  ensureListBoardAccess,
  isBoardOwner,
  isTaskAssignedToUser,
} from "../utils/boardAccess.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const VALID_STATUSES = ["To Do", "In Progress", "Done"];

const ensureBoardAccess = async (userId, listId) => {
  const { list, board } = await ensureListBoardAccess(listId, userId);
  return { list, board };
};

const ensureTaskAssignmentAllowed = async (board, assignedTo) => {
  if (!assignedTo) return;

  const user = await User.findById(assignedTo);
  if (!user) {
    const error = new Error("Assigned user not found");
    error.statusCode = 404;
    throw error;
  }

  const ownerId = board.owner?._id
    ? board.owner._id.toString()
    : board.owner.toString();
  const boardHasUser =
    board.members.some((member) => {
      const memberId = member?._id ? member._id.toString() : member.toString();
      return memberId === user._id.toString();
    }) || ownerId === user._id.toString();

  if (!boardHasUser) {
    const error = new Error("Only board members can be assigned to tasks");
    error.statusCode = 403;
    throw error;
  }
};

export const createTask = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, status, assignedTo, dueDate } = req.body;

    if (!isValidObjectId(listId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid list id" });
    }

    const { list, board } = await ensureBoardAccess(req.user._id, listId);

    if (!isBoardOwner(board, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only the board leader can create tasks",
      });
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      return res
        .status(400)
        .json({ success: false, message: "Task title is required" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task status" });
    }

    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assigned user id" });
    }

    if (assignedTo) {
      await ensureTaskAssignmentAllowed(board, assignedTo);
    }

    const validDueDate = dueDate ? new Date(dueDate) : null;
    if (dueDate && Number.isNaN(validDueDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid due date" });
    }

    const task = await Task.create({
      title: trimmedTitle,
      description: description?.trim() || "",
      status: status || "To Do",
      list: list._id,
      assignedTo: assignedTo || null,
      dueDate: validDueDate,
    });

    await logActivity({
      user: req.user._id,
      action: "Task created",
      board: board._id,
      list: list._id,
      task: task._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("list", "title");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
      boardId: board._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while creating task",
    });
  }
};

export const getTasksByList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(listId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid list id" });
    }

    const { list, board } = await ensureBoardAccess(req.user._id, listId);

    const filters = { list: list._id };

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid task status filter" });
      }
      filters.status = status;
    }

    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const pageLimit = Number(limit) > 0 ? Number(limit) : 10;

    const totalTasks = await Task.countDocuments(filters);
    const tasks = await Task.find(filters)
      .populate("assignedTo", "name email")
      .populate("list", "title")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      tasks,
      pagination: {
        currentPage,
        limit: pageLimit,
        totalTasks,
        totalPages: Math.ceil(totalTasks / pageLimit) || 1,
      },
      boardId: board._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while fetching tasks",
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task id" });
    }

    const task = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("list", "title board");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const board = await Board.findById(task.list.board);

    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }

    await ensureBoardMembership(task.list.board.toString(), req.user._id);

    return res.status(200).json({ success: true, task });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while fetching task",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignedTo, dueDate, list } = req.body;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task id" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const currentList = await List.findById(task.list);
    if (!currentList) {
      return res
        .status(404)
        .json({ success: false, message: "List not found" });
    }

    const board = await Board.findById(currentList.board);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }

    await ensureBoardMembership(currentList.board.toString(), req.user._id);

    const isOwner = isBoardOwner(board, req.user._id);
    const isAssignedUser = isTaskAssignedToUser(task, req.user._id);

    if (!isOwner && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        message: "You can only update tasks assigned to you",
      });
    }

    if (!isOwner) {
      const restrictedFields = [
        title !== undefined,
        description !== undefined,
        assignedTo !== undefined,
        dueDate !== undefined,
        list !== undefined,
      ].some(Boolean);

      if (restrictedFields) {
        return res.status(403).json({
          success: false,
          message:
            "Members can only update the status of tasks assigned to them",
        });
      }

      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: "Please provide a new status",
        });
      }
    }

    if (title !== undefined) {
      const trimmedTitle = title?.trim();
      if (!trimmedTitle) {
        return res
          .status(400)
          .json({ success: false, message: "Task title is required" });
      }
      task.title = trimmedTitle;
    }

    if (description !== undefined) {
      task.description = description?.trim() || "";
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid task status" });
      }
      task.status = status;
    }

    if (assignedTo !== undefined) {
      if (!assignedTo) {
        task.assignedTo = null;
      } else {
        if (!isValidObjectId(assignedTo)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid assigned user id" });
        }

        const userExists = await User.findById(assignedTo);
        if (!userExists) {
          return res
            .status(404)
            .json({ success: false, message: "Assigned user not found" });
        }

        const boardForAssignment = await ensureBoardMembership(
          currentList.board.toString(),
          req.user._id,
        );
        await ensureTaskAssignmentAllowed(boardForAssignment, assignedTo);
        task.assignedTo = assignedTo;
      }
    }

    if (dueDate !== undefined) {
      if (!dueDate) {
        task.dueDate = null;
      } else {
        const parsedDate = new Date(dueDate);
        if (Number.isNaN(parsedDate.getTime())) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid due date" });
        }
        task.dueDate = parsedDate;
      }
    }

    if (list !== undefined) {
      if (!list) {
        return res
          .status(400)
          .json({ success: false, message: "List is required" });
      }

      if (!isValidObjectId(list)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid list id" });
      }

      const nextList = await List.findById(list);
      if (!nextList) {
        return res
          .status(404)
          .json({ success: false, message: "Target list not found" });
      }

      const nextBoard = await Board.findById(nextList.board);
      if (!nextBoard) {
        return res
          .status(404)
          .json({ success: false, message: "Target board not found" });
      }

      await ensureBoardMembership(nextBoard._id.toString(), req.user._id);
      task.list = list;
    }

    const previousStatus = task.status;
    const previousAssignedTo = task.assignedTo
      ? task.assignedTo.toString()
      : null;
    const previousListId = task.list ? task.list.toString() : null;

    await task.save();

    if (status !== undefined && status !== previousStatus) {
      await logActivity({
        user: req.user._id,
        action: `Task status changed to ${status}`,
        board: board._id,
        list: task.list,
        task: task._id,
      });
    }

    if (
      assignedTo !== undefined &&
      (previousAssignedTo || null) !== (assignedTo || null)
    ) {
      await logActivity({
        user: req.user._id,
        action: assignedTo
          ? `Task assigned to ${assignedTo}`
          : "Task unassigned",
        board: board._id,
        list: task.list,
        task: task._id,
      });
    }

    if (list !== undefined && list !== previousListId) {
      await logActivity({
        user: req.user._id,
        action: "Task moved to another list",
        board: board._id,
        list: task.list,
        task: task._id,
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("list", "title");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while updating task",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid task id" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const list = await List.findById(task.list);
    if (!list) {
      return res
        .status(404)
        .json({ success: false, message: "List not found" });
    }

    const board = await Board.findById(list.board);
    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }

    await ensureBoardMembership(list.board.toString(), req.user._id);

    if (!isBoardOwner(board, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only the board leader can delete tasks",
      });
    }

    await logActivity({
      user: req.user._id,
      action: "Task deleted",
      board: board._id,
      list: list._id,
      task: task._id,
    });

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      taskId: task._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while deleting task",
    });
  }
};
