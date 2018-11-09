const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Milestone "Child" schema

/*const MilestoneSchema = new Schema({
  name: String,
  number: Number,
  notificationMessage: String,
  sendEmail: Boolean,
  sendSMS: Boolean,
  updatedBy: {type: String, ref: 'users'},
  updatedAt: new Date(),
  $setOnInsert: {
    createdAt: new Date()
  }
},
{
  collection: 'milestones',
  timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});*/

const MilestoneList = new Schema({
  title: String,
  updatedBy: {type: String, ref: 'users'},
  milestones: [{type: String, ref: 'milestones'}],
},
{
  collection: 'milestoneLists',
  timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

module.exports = mongoose.model('MilestoneList', MilestoneList);
