import mongoose from "mongoose";
import Board from "../models/Board.js";
import List from "../models/List.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";
import { ensureBoardMembership } from "../utils/boardAccess.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: "Board title is required",
      });
    }

    const board = await Board.create({
      title: trimmedTitle,
      description: description?.trim() || "",
      owner: req.user._id,
      members: [req.user._id],
    });

    await logActivity({
      user: req.user._id,
      action: "Board created",
      board: board._id,
    });

    const populatedBoard = await Board.findById(board._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(201).json({
      success: true,
      message: "Board created successfully",
      board: populatedBoard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating board",
    });
  }
};

export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    const boardIds = boards.map((board) => board._id);
    const lists = await List.find({ board: { $in: boardIds } })
      .select("_id board")
      .lean();
    const boardByListId = new Map(
      lists.map((list) => [list._id.toString(), list.board.toString()]),
    );
    const taskCountsByList = await Task.aggregate([
      { $match: { list: { $in: lists.map((list) => list._id) } } },
      { $group: { _id: "$list", count: { $sum: 1 } } },
    ]);
    const taskCountsByBoard = new Map();

    taskCountsByList.forEach(({ _id, count }) => {
      const boardId = boardByListId.get(_id.toString());
      if (boardId) {
        taskCountsByBoard.set(
          boardId,
          (taskCountsByBoard.get(boardId) || 0) + count,
        );
      }
    });

    const boardsWithDetails = boards.map((board) => {
      const ownerId = board.owner?._id || board.owner;

      return {
        ...board.toObject(),
        role:
          ownerId.toString() === req.user._id.toString() ? "owner" : "member",
        taskCount: taskCountsByBoard.get(board._id.toString()) || 0,
      };
    });

    res.status(200).json({
      success: true,
      boards: boardsWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching boards",
    });
  }
};

export const getBoardMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await ensureBoardMembership(id, req.user._id);

    res.status(200).json({
      success: true,
      boardId: board._id,
      members: board.members,
      owner: board.owner,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while fetching board members",
    });
  }
};

export const addBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const board = await ensureBoardMembership(id, req.user._id, {
      ownerOnly: true,
    });
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail) {
      return res.status(400).json({
        success: false,
        message: "Member email is required",
      });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const ownerId = board.owner?._id
      ? board.owner._id.toString()
      : board.owner.toString();
    if (user._id.toString() === ownerId) {
      return res.status(400).json({
        success: false,
        message: "Board owner is already a member of the board",
      });
    }

    const alreadyMember = board.members.some((member) => {
      const memberId = member?._id ? member._id.toString() : member.toString();
      return memberId === user._id.toString();
    });

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this board",
      });
    }

    board.members.push(user._id);
    await board.save();

    await logActivity({
      user: req.user._id,
      action: `Added ${user.name} to board`,
      board: board._id,
    });

    const updatedBoard = await Board.findById(board._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      board: updatedBoard,
      member: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while adding board member",
    });
  }
};

export const removeBoardMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const board = await ensureBoardMembership(id, req.user._id, {
      ownerOnly: true,
    });

    if (!isValidObjectId(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member id",
      });
    }

    const ownerId = board.owner?._id
      ? board.owner._id.toString()
      : board.owner.toString();
    if (memberId === ownerId) {
      return res.status(400).json({
        success: false,
        message: "Board owner cannot be removed from the board",
      });
    }

    const memberExists = board.members.some((member) => {
      const memberIdValue = member?._id
        ? member._id.toString()
        : member.toString();
      return memberIdValue === memberId;
    });

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this board",
      });
    }

    board.members = board.members.filter((member) => {
      const memberIdValue = member?._id
        ? member._id.toString()
        : member.toString();
      return memberIdValue !== memberId;
    });

    const memberUser = await User.findById(memberId);
    await board.save();

    const listIds = await List.find({ board: board._id }).distinct("_id");
    await Task.updateMany(
      { list: { $in: listIds }, assignedTo: memberId },
      { $set: { assignedTo: null } },
    );

    await logActivity({
      user: req.user._id,
      action: memberUser
        ? `Removed ${memberUser.name} from board`
        : "Removed member from board",
      board: board._id,
    });

    const updatedBoard = await Board.findById(board._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      board: updatedBoard,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while removing board member",
    });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await ensureBoardMembership(id, req.user._id);

    res.status(200).json({
      success: true,
      board,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while fetching board",
    });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const board = await ensureBoardMembership(id, req.user._id, {
      ownerOnly: true,
    });
    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: "Board title is required",
      });
    }

    board.title = trimmedTitle;
    board.description = description?.trim() || "";

    await board.save();

    await logActivity({
      user: req.user._id,
      action: "Board updated",
      board: board._id,
    });

    const updatedBoard = await Board.findById(board._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      message: "Board updated successfully",
      board: updatedBoard,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while updating board",
    });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await ensureBoardMembership(id, req.user._id, {
      ownerOnly: true,
    });

    await logActivity({
      user: req.user._id,
      action: "Board deleted",
      board: board._id,
    });

    await List.deleteMany({ board: board._id });
    await board.deleteOne();

    res.status(200).json({
      success: true,
      message: "Board deleted successfully",
      boardId: board._id,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Server error while deleting board",
    });
  }
};
