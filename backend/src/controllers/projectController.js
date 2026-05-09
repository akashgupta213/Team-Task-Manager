// src/controllers/projectController.js
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";

// POST /api/projects — create a project (creator becomes ADMIN)
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
  return res.status(400).json({ message: "Project name and description are required" });
}
  const project = await Project.create({ name, description, createdBy: req.user._id });

  // Auto-add creator as ADMIN member
  await ProjectMember.create({ projectId: project._id, userId: req.user._id, role: "ADMIN" });

  res.status(201).json(project);
};

// GET /api/projects — list projects the logged-in user is a member of
export const getProjects = async (req, res) => {
  const memberships = await ProjectMember.find({ userId: req.user._id }).populate("projectId");
  const projects = memberships.map(m => m.projectId);
  res.json(projects);
};

// POST /api/projects/:id/members — add a member (ADMIN only)
export const addMember = async (req, res) => {
  const { userId, role } = req.body; // role = "MEMBER" or "ADMIN"

  // Check requester is ADMIN of this project
  const requester = await ProjectMember.findOne({ projectId: req.params.id, userId: req.user._id });
  if (!requester || requester.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admins can add members" });
  }

  const existing = await ProjectMember.findOne({ projectId: req.params.id, userId });
  if (existing) return res.status(400).json({ message: "Already a member" });

  const member = await ProjectMember.create({ projectId: req.params.id, userId, role: role || "MEMBER" });
  res.status(201).json(member);
};

export const getMembers = async (req, res) => {
  const members = await ProjectMember.find({ projectId: req.params.id })
    .populate("userId", "name email");
  res.json(members);
};