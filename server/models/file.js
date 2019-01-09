const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let File = new mongoose.Schema({
    fileRef: String,
    refUser: [{type: Schema.Types.ObjectId, ref: 'User'}],
    milestoneList: {
      _id: {type: Schema.Types.ObjectId, ref: 'MilestoneList'},
      milestones: [{
        _id: {type: Schema.Types.ObjectId, ref: 'Milestone'},
        completed: Boolean,
        updatedBy: {type: Schema.Types.ObjectId, ref: 'User'},
        updatedAt: Date,
        comments: [{
          user: {type: Schema.Types.ObjectId, ref: 'User'},
          timestamp: Date,
          comment: String
        }]
      }]
      },
    deedsOffice: String,
    propertyDescription: String,
    /*erfNumber: String,
    action: String,
    propertyType: String,
    portionNumber: Number,*/
    contacts: [{type: Schema.Types.ObjectId, ref: 'Contact'}],
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'User'},
  },
  {
    collection: 'files',
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
  });

module.exports = mongoose.model('File', File);
