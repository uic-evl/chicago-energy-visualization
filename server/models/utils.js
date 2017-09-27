const mongoose = require('mongoose');

var Utils = mongoose.model('utils', {
	"community_areas": {
		"gas": {
			"max": Number,
			"min": Number,
			"avg": Number
		},
		"electricity": {
			"max": Number,
			"min": Number,
			"avg": Number
		}
	}, 
	"tracts": {
		"gas": {
			"max": Number,
			"min": Number,
			"avg": Number
		},
		"electricity": {
			"max": Number,
			"min": Number,
			"avg": Number
		}
	},
	"blocks": {
		"gas": {
			"max": Number,
			"min": Number,
			"avg": Number
		},
		"electricity": {
			"max": Number,
			"min": Number,
			"avg": Number
		}
	}
});

module.exports = {Utils};