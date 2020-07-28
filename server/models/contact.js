const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Contact = new mongoose.Schema({
    passwordHash: String,
    email: String,
    type: String,
    name: String,
    surname: String,
    title: String,
    cell: String,
    dob: String,
    birthday: Number,
    birthmonth: Number,
    forgotPassword: {
      token: String,
      expiry: Date
    },
    verified: Boolean,
    entity: {type: Schema.Types.ObjectId, ref: 'Entity'}
  },
  {
    collection: 'contacts'
  });

module.exports = mongoose.model('Contact', Contact);
