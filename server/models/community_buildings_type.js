const mongoose = require('mongoose');

var CommunityBuildings = mongoose.model('community_buildings', {
	"Residential": Number,
	"Commercial": Number,
	"Office": Number,
	"Recreational": Number,
	"Medical": Number,
	"Educational": Number,
	"Government": Number,
	"Industrial": Number,
	"Green": Number,
	"Vacant": Number,
	"Water": Number,
	"Utilities": Number
});

module.exports = {CommunityBuildings};