const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const isValidAssignee = async (projectId, userId) => {
  if (!userId) return true; 
  const project = await Project.findById(projectId);
  if (!project) return false;

  if (project.owner.toString() === userId.toString()) return true;

  const member = project.members.find(m => (m.user?.toString() === userId.toString()) || (m.toString() === userId.toString()));
  
  return member && (member.role === 'Admin' || member.role === 'Developer');
};

exports.createTask = async (req, res) => {
  try {
    const { title, project, assignee } = req.body;

    const allowed = await isValidAssignee(project, assignee);
    if (!allowed) {
      return res.status(400).json({ success: false, message: 'Access Denied: Viewers cannot be assigned tasks.' });
    }

    const task = await Task.create({ ...req.body, reporter: req.user.id });

    if (assignee) {
      await Notification.create({
        recipient: assignee,
        sender: req.user.id,
        project,
        type: 'GENERAL',
        message: `assigned a new task to you: "${title}"`
      });
    }

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { assignee } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (assignee && assignee !== task.assignee?.toString()) {
      const allowed = await isValidAssignee(task.project, assignee);
      if (!allowed) {
        return res.status(400).json({ success: false, message: 'Access Denied: This user is a Viewer and cannot be assigned tasks.' });
      }
    }

    const updatePayload = { ...req.body };
    if (assignee === null) {
      updatePayload.$unset = { assignee: 1 };
      delete updatePayload.assignee;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      updatePayload, 
      { returnDocument: 'after', runValidators: true } 
    );
    
    res.status(200).json({ success: true, task: updatedTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { returnDocument: 'after' } 
    );
    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};