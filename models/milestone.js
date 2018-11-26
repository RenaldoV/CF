const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Milestone "Child" schema

const Milestone = new Schema({
  name: String,
  number: Number,
  notificationMessage: String,
  sendEmail: Boolean,
  sendSMS: Boolean,
  comments: [{
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    comment: String
  }],
  updatedBy: {type: Schema.Types.ObjectId, ref: 'User'}
},
{
  collection: 'milestones',
  timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

module.exports = mongoose.model('Milestone', Milestone);
