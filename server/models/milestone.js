const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Milestone "Child" schema

const Milestone = new Schema({
  name: String,
  number: Number,
  emailMessage: String,
  smsMessage: String,
  sendEmail: Boolean,
  sendSMS: Boolean,
  updatedBy: {type: Schema.Types.ObjectId, ref: 'User'}
},
{
  collection: 'milestones',
  timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

module.exports = mongoose.model('Milestone', Milestone);
