const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { addComment, getCommentsByTask } = require('../controllers/commentController');

router.use(protect); // Login zaroori hai

// :taskId parameter use kar rahe hain
router.post('/:taskId', addComment);
router.get('/:taskId', getCommentsByTask);

module.exports = router;