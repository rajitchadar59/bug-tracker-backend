const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { taskId } = req.params;

    const comment = await Comment.create({
      task: taskId,
      user: req.user.id,
      text
    });

    await comment.populate('user', 'name');

    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name')
      .sort({ createdAt: -1 }); 

    res.status(200).json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};