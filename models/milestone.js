const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Milestone "Child" schema

const Milestone = new Schema({
  name: String,
  number: Number,
  notificationMessage: String,
  sendEmail: Boolean,
  sendSMS: Boolean,
  updatedBy: {type: String, ref: 'users'}
},
{
  collection: 'milestones',
  timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

module.exports = mongoose.model('Milestone', Milestone);
