const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, deleteProject } = require('../controllers/projectController');
const { protect, authorizeProjectRole } = require('../middlewares/authMiddleware');

router.use(protect); // Login sabke liye zaroori hai

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);

// 🔐 RBAC: Sirf Admin delete kar sakta hai
router.delete('/:id', authorizeProjectRole('Admin'), deleteProject);

module.exports = router;