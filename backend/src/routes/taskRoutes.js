import express from "express";
import { createTask, getTasks, updateTaskStatus } from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.patch("/:id", protect, updateTaskStatus);

export default router;