import express from "express";
import { createProject, getProjects, addMember, getMembers } from "../controllers/projectController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.post("/:id/members", protect, addMember);
router.get("/:id/members", protect, getMembers);

export default router;