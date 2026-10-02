import express from "express";
import {
  addBoardMember,
  createBoard,
  deleteBoard,
  getBoardById,
  getBoardMembers,
  getBoards,
  removeBoardMember,
  updateBoard,
} from "../controllers/boardController.js";
import { createList, getBoardLists } from "../controllers/listController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createBoard);
router.get("/", getBoards);
router.get("/:id/members", getBoardMembers);
router.post("/:id/members", addBoardMember);
router.delete("/:id/members/:memberId", removeBoardMember);
router.get("/:id", getBoardById);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

router.post("/:boardId/lists", createList);
router.get("/:boardId/lists", getBoardLists);

export default router;
