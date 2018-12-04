const mongoose = require('mongoose');

let Contact = new mongoose.Schema({
    passwordHash: String,
    email: String,
    type: String,
    name: String,
    cell: String,
    forgotPassword: {
      token: String,
      expiry: Date
    }
  },
  {
    collection: 'contacts'
  });

module.exports = mongoose.model('Contact', Contact);
