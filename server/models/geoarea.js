const mongoose = require('mongoose');
const GeoJSON  = require('mongoose-geojson-schema');

var schema = new mongoose.Schema({
  properties: {
    community: {
      type: String
    },
    area_num_1: {
      type: Number
    },
    buildings: {},
    TOTAL_THERMS: {
      type: Number
    },
    TOTAL_KWH: {
      type: Number
    },
    KWH_TOTAL_SQFT: {
      type: Number
    },
    THERMS_TOTAL_SQFT: {
      type: Number
    },
    KWH_TOTAL_SQMETERS: {
      type: Number
    },
    THERMS_TOTAL_SQMETERS: {
      type: Number
    },
    KWH_TOTAL_CAPITA: { type: Number },
    THERMS_TOTAL_CAPITA: { type: Number },
    AREA_ELECTRICITY: { type: Number },
    AREA_GAS: { type: Number }
  },
  geometry: mongoose.Schema.Types.Geometry
});

var GeoArea = mongoose.model('geo_areas', schema);

module.exports = {GeoArea};