import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: [true, "Activity action is required"],
      trim: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      default: null,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      default: null,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
