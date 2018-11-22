const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let File = new mongoose.Schema({
    fileRef: String,
    action: String,
    ourRef: String,
    milestoneProcess: {type: Schema.Types.ObjectId, ref: 'Milestone'},
    propertyType: String,
    deedsOffice: String,
    erfNumber: String,
    portionNumber: Number,
    contacts: [{type: Schema.Types.ObjectId, ref: 'Contact'}]
  },
  {
    collection: 'files'
  });

module.exports = mongoose.model('File', File);
