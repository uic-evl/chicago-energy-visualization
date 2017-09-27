const mongoose = require('mongoose');
const GeoJSON  = require('mongoose-geojson-schema');

var schema = new mongoose.Schema({
  properties: {
	tractce10: { type: String },
    name10: { type: String },
    commarea: { type: String }
  },
  geometry: mongoose.Schema.Types.Geometry
});

var GeoTract = mongoose.model('geo_tracts', schema);

module.exports = {GeoTract};