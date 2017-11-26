const COMMUNITY_AREAS = "COMMUNITY_AREAS";
const CENSUS_TRACTS   = "CENSUS_TRACTS";
const CENSUS_BLOCKS   = "CENSUS_BLOCKS";

function Model() {
	this.geo_community_areas = null;
	this.geo_census_tracts = null;
	this.geo_census_blocks = null;
	this.selected_area = null;

	this.serverPort = "localhost:3000";
	this.protocol = "http://";
}

Model.prototype = {

	constructor: Model,

	getGeospatialUrl: function(type, id) {

		let url = this.protocol + this.serverPort;
		if (type == COMMUNITY_AREAS)
			url = url + "/geoareas";
		else if (type == CENSUS_TRACTS){
			url = url + "/geotracts";
			if (id) url = url + "/" + id;
		}		
		else if (type == CENSUS_BLOCKS)
			url = url + "/census_blocks";
		return url;

	},

	loadGeospatialData: function(type, id) {

		let url = this.getGeospatialUrl(type, id);
		return $.getJSON(url, { format: "jsonp" }).done((results) => {
			if (type == COMMUNITY_AREAS)
				this.geo_community_areas = results;
			else if (type == CENSUS_TRACTS){
				if (id)
					this.selected_area = results;
				else
					this.geo_census_tracts = results;
			} else if (type == CENSUS_BLOCKS)
				this.selected_area = results.data;
			console.log("geospatial data loaded from model");
		});
	}

}