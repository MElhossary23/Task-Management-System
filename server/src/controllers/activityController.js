import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";
import { ensureBoardMembership } from "../utils/boardAccess.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getBoardActivity = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board id",
      });
    }

    const board = await ensureBoardMembership(boardId, req.user._id);

    const activity = await ActivityLog.find({ board: boardId })
      .populate("user", "name email")
      .populate("list", "title")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      boardId: board._id,
      activity,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while fetching activity",
    });
  }
};
