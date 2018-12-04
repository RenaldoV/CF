const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let Properties = new mongoose.Schema({
    propertyTypes: [{type: String}],
    actionTypes: [{type: String}],
    deedsOffices: [{type: String}]
  },
  {
    collection: 'properties'
  });

module.exports = mongoose.model('Properties', Properties);
