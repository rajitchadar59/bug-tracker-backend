const Notification = require('../models/Notification');
const Project = require('../models/Project');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.sendInvite = async (req, res) => {
  try {
    const { email, projectId, role } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied: Sirf Admin members ko invite kar sakta hai.' });
    }

    const recipientUser = await User.findOne({ email });
    if (!recipientUser) return res.status(404).json({ success: false, message: 'User not found' });

    const isAlreadyMember = project.members.some(m => m.user.toString() === recipientUser._id.toString());
    if (isAlreadyMember) return res.status(400).json({ success: false, message: 'User is already in the project' });

    await Notification.create({
      recipient: recipientUser._id,
      sender: req.user.id,
      project: projectId,
      type: 'INVITE',
      message: `invited you to join "${project.name}" as a ${role || 'Developer'}`
    });

    res.status(200).json({ success: true, message: 'Invitation sent!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.handleInvite = async (req, res) => {
  try {
    const { action } = req.body;
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    if (action === 'ACCEPTED') {
      const messageParts = notification.message.split(' as a ');
      const assignedRole = messageParts.length > 1 ? messageParts[1] : 'Developer';

      await Project.findByIdAndUpdate(notification.project, { 
        $addToSet: { members: { user: req.user.id, role: assignedRole } } 
      });
    }

    notification.status = action;
    await notification.save();
    res.status(200).json({ success: true, message: `Invite ${action}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, type: 'GENERAL', status: 'PENDING' },
      { $set: { status: 'READ' } }
    );
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};