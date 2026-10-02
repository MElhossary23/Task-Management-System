import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ user, action, board, list, task }) => {
  if (!user || !action) {
    return null;
  }

  return ActivityLog.create({
    user,
    action,
    board: board || undefined,
    list: list || undefined,
    task: task || undefined,
  });
};
