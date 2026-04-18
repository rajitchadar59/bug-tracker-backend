const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  type: { type: String, enum: ['INVITE', 'GENERAL'], default: 'GENERAL' },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'READ'], default: 'PENDING' },
  message: { type: String }
}, { timestamps: true });

notificationSchema.index(
  { updatedAt: 1 }, 
  { 
    expireAfterSeconds: 604800,
    partialFilterExpression: { 
      status: { $in: ['READ', 'ACCEPTED', 'REJECTED'] } 
    } 
  }
);

module.exports = mongoose.model('Notification', notificationSchema);