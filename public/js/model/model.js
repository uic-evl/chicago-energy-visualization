const COMMUNITY_AREAS = "COMMUNITY_AREAS";
const CENSUS_TRACTS   = "CENSUS_TRACTS";
const CENSUS_BLOCKS   = "CENSUS_BLOCKS";

function Model() {
	this.geo_community_areas = null;
	this.geo_census_tracts = null;
	this.geo_census_blocks = null;

	this.serverPort = "localhost:3000";
	this.protocol = "http://";
}

Model.prototype = {

	constructor: Model,

	getGeospatialUrl: function(type) {

		let url = this.protocol + this.serverPort;
		if (type == COMMUNITY_AREAS)
			url = url + "/geoareas";
		else if (type == CENSUS_TRACTS)
			url = url + "/census_tracts";
		else if (type == CENSUS_BLOCKS)
			url = url + "/census_blocks";
		return url;

	},

	loadGeospatialData: function(type) {

		let url = this.getGeospatialUrl(type);
		return $.getJSON(url, { format: "jsonp" }).done((data) => {
			if (type == COMMUNITY_AREAS)
				this.geo_community_areas = data;
			else if (type == CENSUS_TRACTS)
				this.geo_census_tracts = data;
			else if (type == CENSUS_TRACTS)
				this.geo_census_blocks = data;
			console.log("geospatial data loaded from model");
		});
	}

}