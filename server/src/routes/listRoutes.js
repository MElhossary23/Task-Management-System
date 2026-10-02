import express from "express";
import { createTask, getTasksByList } from "../controllers/taskController.js";
import {
  deleteList,
  getListById,
  updateList,
} from "../controllers/listController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/:listId/tasks", createTask);
router.get("/:listId/tasks", getTasksByList);
router.get("/:id", getListById);
router.put("/:id", updateList);
router.delete("/:id", deleteList);

export default router;
