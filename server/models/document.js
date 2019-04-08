const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Document = new mongoose.Schema({
    name: String,
    path: String,
    fileID: {type: Schema.Types.ObjectId, ref: 'File'},
    requiredDocumentID: {type: Schema.Types.ObjectId, ref: 'File'},
  },
  {
    collection: 'documents'
  });

module.exports = mongoose.model('Document', Document);
