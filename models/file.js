const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let File = new mongoose.Schema({
    fileRef: String,
    action: String,
    ourRef: String,
    milestoneList: {type: Schema.Types.ObjectId, ref: 'MilestoneList'},
    propertyType: String,
    deedsOffice: String,
    erfNumber: String,
    portionNumber: Number,
    contacts: [{type: Schema.Types.ObjectId, ref: 'Contact'}],
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'User'},
  },
  {
    collection: 'files',
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
  });

module.exports = mongoose.model('File', File);
