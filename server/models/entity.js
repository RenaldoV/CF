const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Entity = new Schema({
    name: String,
    address: String,
    files: [{type: Schema.Types.ObjectId, ref: 'File'}],
    telephone: String,
    contacts: [{type: Schema.Types.ObjectId, ref: 'Contact'}],
    website: String
  },
  {
    collection: 'entities'
  });

module.exports = mongoose.model('Entity', Entity);
