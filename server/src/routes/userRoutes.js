import express from "express";
import { getCurrentUser, getUsers } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.get("/", protect, getUsers);

export default router;
