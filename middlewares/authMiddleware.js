const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorizeProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let projectId = req.params?.projectId || req.body?.project || req.body?.projectId;

      if (!projectId && req.params?.id) {
        const task = await Task.findById(req.params.id);
        if (task) {
          projectId = task.project;
        } else {
          projectId = req.params.id;
        }
      }

      if (!projectId) return res.status(400).json({ success: false, message: 'Project context missing' });

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      let userRole = 'Viewer';
      
      if (project.owner?.toString() === req.user?.id?.toString()) {
        userRole = 'Admin';
      } else {
        const member = project.members?.find(m => m.user?.toString() === req.user?.id?.toString());
        if (member) userRole = member.role;
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access Denied: Aapke paas ${allowedRoles.join(' ya ')} ki permission nahi hai.` 
        });
      }

      next();
    } catch (error) {
      console.error("🔥 Backend Auth Middleware Error Details:", error);
      res.status(500).json({ success: false, message: 'Auth Middleware Error' });
    }
  };
};

module.exports = { protect, authorizeProjectRole };