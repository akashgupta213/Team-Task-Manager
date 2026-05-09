import Task from "../models/Task.js";
import ProjectMember from "../models/ProjectMember.js";

export const getDashboard = async (req, res) => {
  try {
    const memberships = await ProjectMember.find({ userId: req.user._id });
    const projectIds = memberships.map(m => m.projectId);

    const total = await Task.countDocuments({ projectId: { $in: projectIds } });
    const completed = await Task.countDocuments({ projectId: { $in: projectIds }, status: "DONE" });
    const inProgress = await Task.countDocuments({ projectId: { $in: projectIds }, status: "IN_PROGRESS" });
    const overdue = await Task.countDocuments({
      projectId: { $in: projectIds },
      status: { $ne: "DONE" },
      dueDate: { $lt: new Date() }
    });

    res.json({ total, completed, inProgress, overdue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};