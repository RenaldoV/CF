const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MilestoneList = new Schema({
  title: String,
  updatedBy: {type: Schema.Types.ObjectId, ref: 'User'},
  milestones: [{type: Schema.Types.ObjectId, ref: 'Milestone'}],
},
{
  collection: 'milestoneLists',
  timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

module.exports = mongoose.model('MilestoneList', MilestoneList);
