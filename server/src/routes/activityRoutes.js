import express from "express";
import { getBoardActivity } from "../controllers/activityController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/:boardId/activity", getBoardActivity);

export default router;
