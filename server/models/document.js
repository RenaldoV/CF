const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Document = new mongoose.Schema({
    name: String,
    path: String,
    mimeType: String,
    fileID: {type: Schema.Types.ObjectId, ref: 'File'},
    requiredDocumentID: {type: Schema.Types.ObjectId, ref: 'RequiredDocument'},
    contactID : {type: Schema.Types.ObjectId, ref: 'Contact'}
  },
  {
    collection: 'documents'
  });

module.exports = mongoose.model('Document', Document);
