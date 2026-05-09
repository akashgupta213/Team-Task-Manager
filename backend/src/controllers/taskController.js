import Task from "../models/Task.js";
import ProjectMember from "../models/ProjectMember.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;
    
    if (!title || !projectId || !assignedTo || !dueDate || !description) {
    return res.status(400).json({ message: "title, projectId, assignedTo, dueDate and description are required" });
    }
    const membership = await ProjectMember.findOne({ projectId, userId: req.user._id });
    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can create tasks" });
    }

    const task = await Task.create({ title, description, projectId, assignedTo, dueDate });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tasks = await Task.find({ projectId }).populate("assignedTo", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};