const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Admin', 'Manager', 'Developer', 'Viewer'], default: 'Developer' },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true, select: false }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('securityAnswer')) {
    const salt = await bcrypt.genSalt(10);
    this.securityAnswer = await bcrypt.hash(this.securityAnswer.trim().toLowerCase(), salt);
  }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchSecurityAnswer = async function(enteredAnswer) {
  return await bcrypt.compare(enteredAnswer.trim().toLowerCase(), this.securityAnswer);
};

module.exports = mongoose.model('User', userSchema);