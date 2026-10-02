import express from "express";
import {
  deleteComment,
  updateComment,
} from "../controllers/commentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
