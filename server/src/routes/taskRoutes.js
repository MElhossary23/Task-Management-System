import express from "express";
import {
  createComment,
  getTaskComments,
} from "../controllers/commentController.js";
import {
  deleteTask,
  getTaskById,
  updateTask,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/:taskId/comments", createComment);
router.get("/:taskId/comments", getTaskComments);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
