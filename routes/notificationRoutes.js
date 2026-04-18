const express = require('express');
const router = express.Router();
const { getNotifications, sendInvite, handleInvite, markAllAsRead } = require('../controllers/notificationController');
const { protect, authorizeProjectRole } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/mark-read', markAllAsRead);
router.put('/:id/handle', handleInvite);

// 🔐 RBAC: Sirf Admin (Project Owner) hi naye logo ko invite kar sakta hai
router.post('/invite', authorizeProjectRole('Admin'), sendInvite);

module.exports = router;