const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new mongoose.Schema({
    passwordHash: String,
    company: String,
    email: String,
    role: String,
    name: String,
    surname: String,
    cell: String,
    verified: Boolean,
    companyAdmin: {type: Schema.Types.ObjectId, ref: 'User'},
    forgotPassword: {
      token: String,
      expiry: Date
    },
    files: [{type: Schema.Types.ObjectId, ref: 'File'}],
    milestoneLists: [{type: Schema.Types.ObjectId, ref: 'milestoneLists'}],
    contacts: [{type: Schema.Types.ObjectId, ref: 'Contact'}],
    properties: {type: Schema.Types.ObjectId, ref: 'Properties'}
  },
  {
    collection: 'users'
  });

module.exports = mongoose.model('User', User);

