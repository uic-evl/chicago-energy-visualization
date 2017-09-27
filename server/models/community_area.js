const mongoose = require('mongoose');

var CommunityArea = mongoose.model('community_areas', {
	"COMMUNITY_AREA_NAME": String,
	"TOTAL_KWH": Number,
	"TOTAL_THERMS": Number,
	"TOTAL_POPULATION": Number,
	"TOTAL_UNITS": Number,
	"COMMUNITY_AREA_NUMBER": Number
});

module.exports = {CommunityArea};