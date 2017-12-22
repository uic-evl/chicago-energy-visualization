const mongoose = require('mongoose');
const GeoJSON  = require('mongoose-geojson-schema');

var schema = new mongoose.Schema({
  properties: {
	tractce10: { type: String },
    name10: { type: String },
    commarea: { type: String },
    TOTAL_THERMS: { type: Number },
    TOTAL_KWH: { type: Number },
    KWH_TOTAL_SQFT: { type: Number },
    THERMS_TOTAL_SQFT: { type: Number },
    KWH_TOTAL_SQMETERS: { type: Number },
    THERMS_TOTAL_SQMETERS: { type: Number },
    KWH_TOTAL_CAPITA: { type: Number },
    THERMS_TOTAL_CAPITA: { type: Number }
  },
  geometry: mongoose.Schema.Types.Geometry
});

var GeoTract = mongoose.model('geo_tracts', schema);

module.exports = {GeoTract};