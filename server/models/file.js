const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let File = new mongoose.Schema({
    fileRef: String,
    archived: Boolean,
    archivedAt: String,
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
    bank: String,
    deedsOffice: String,
    propertyDescription: String,
    /*erfNumber: String,
    action: String,
    propertyType: String,
    portionNumber: Number,*/
    contacts: [{type: Schema.Types.ObjectId, ref: 'Contact'}],
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    entity: {type: Schema.Types.ObjectId, ref: 'Entity', required: false},
    summaries: [{
      user: {type: Schema.Types.ObjectId, ref: 'User'},
      timestamp: Date,
      summary: String
    }]
  },
  {
    collection: 'files',
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
  });
File.index({createdAt: -1});

module.exports = mongoose.model('File', File);
