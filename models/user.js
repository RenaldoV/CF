const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new mongoose.Schema({
    passwordHash: String,
    email: String,
    role: String,
    name: String,
    surname: String,
    forgotPassword: {
      token: String,
      expiry: Date
    },
    fileIDs: [{type: String, ref: 'files'}],
    properties: {type: String, ref: 'properties'}
  },
  {
    collection: 'users'
  });

module.exports = mongoose.model('User', User);

