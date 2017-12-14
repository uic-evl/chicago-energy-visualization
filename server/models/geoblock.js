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
    },
    TOTAL_THERMS: {
      type: Number
    },
    TOTAL_KWH: {
      type: Number
    },
    ANONYMOUS: {
      type: Boolean
    }
  },
  geometry: mongoose.Schema.Types.Geometry
});

var GeoBlock = mongoose.model('geo_blocks_4', schema);

module.exports = {GeoBlock};