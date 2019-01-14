const mongoose = require('mongoose');

let Contact = new mongoose.Schema({
    passwordHash: String,
    email: String,
    type: String,
    name: String,
    surname: String,
    title: String,
    cell: String,
    forgotPassword: {
      token: String,
      expiry: Date
    },
    verified: Boolean
  },
  {
    collection: 'contacts'
  });

module.exports = mongoose.model('Contact', Contact);
