const mongoose = require('mongoose');
const GeoJSON  = require('mongoose-geojson-schema');

var schema = new mongoose.Schema({
  properties: {
    community: {
      type: String
    },
    area_num_1: {
      type: Number
    }
  },
  geometry: mongoose.Schema.Types.Geometry
});

var GeoArea = mongoose.model('geo_areas', schema);

module.exports = {GeoArea};