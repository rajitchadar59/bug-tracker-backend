const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getSecurityQuestion = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ success: true, question: user.securityQuestion });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

exports.verifySecurityAnswer = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+securityAnswer');
    if (!user || !(await user.matchSecurityAnswer(req.body.answer))) {
      return res.status(401).json({ message: 'Incorrect answer' });
    }
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.status(200).json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

exports.resetPasswordFinal = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ message: 'Token expired' });
  }
};