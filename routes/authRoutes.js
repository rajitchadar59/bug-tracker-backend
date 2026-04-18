const express = require('express');
const router = express.Router();

// Controllers import karein
const { 
  register, 
  login, 
  getMe, 
  getSecurityQuestion, 
  verifySecurityAnswer, 
  resetPasswordFinal 
} = require('../controllers/authController');

// Middleware import karein
const { protect } = require('../middlewares/authMiddleware');

// --- Public Routes ---
router.post('/register', register);
router.post('/login', login);

// Forgot Password Flow
router.post('/get-question', getSecurityQuestion);
router.post('/verify-answer', verifySecurityAnswer);
router.post('/reset-password', resetPasswordFinal);

// --- Private Routes ---
// Sirf logged-in users hi apna profile (me) access kar sakte hain
router.get('/me', protect, getMe);

module.exports = router;