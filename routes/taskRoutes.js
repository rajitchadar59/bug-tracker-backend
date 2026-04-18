const express = require('express');
const router = express.Router();
const { createTask, getTasksByProject, updateTaskStatus, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, authorizeProjectRole } = require('../middlewares/authMiddleware');

router.use(protect);

// 🔐 RBAC: Viewers cannot create or edit
router.post('/', authorizeProjectRole('Admin', 'Developer'), createTask);
router.put('/:id', authorizeProjectRole('Admin', 'Developer'), updateTask);
router.put('/:id/status', authorizeProjectRole('Admin', 'Developer'), updateTaskStatus);

// 🔐 RBAC: Delete is strict (Admin or Developer)
router.delete('/:id', authorizeProjectRole('Admin', 'Developer'), deleteTask);

// Read access sabko hai jo project ke member hain
router.get('/project/:projectId', getTasksByProject);

module.exports = router;