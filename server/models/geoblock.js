const mongoose = require('mongoose');
const GeoJSON  = require('mongoose-geojson-schema');

var schema = new mongoose.Schema({
  properties: {
    blockce10: {
      type: String
    },
    tractce10: {
      type: String
    },
    name10: {
      type: String
    }
  },
  geometry: mongoose.Schema.Types.Geometry
});

var GeoBlock = mongoose.model('geo_blocks', schema);

module.exports = {GeoBlock};