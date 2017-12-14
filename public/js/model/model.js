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

	this.hist_community_electricity = null;
	this.hist_community_gas = null;
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
			url = url + "/geoblocksByCommunity/" + id;
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
			} else if (type == CENSUS_BLOCKS) {
				/*
				let hasBlocks = self.hasBlocks(id);
				if (hasBlocks == null) console.log("Wrong community id " + id);
				else {
					if (!hasBlocks) {

					}
				}*/
				this.setBlocks(id, results);
				this.selected_area = results;
			}

			this.getHistogramData(type);
			console.log("geospatial data loaded from model");
		});
	},

	getHistogramData: function(type) {

		if (type == COMMUNITY_AREAS && (this.hist_community_electricity == null && this.hist_community_gas == null)) {
			this.hist_community_electricity = [];
			this.hist_community_gas = [];
			for (let i = 0; i < this.geo_community_areas.data.length; i++) {
				this.hist_community_electricity.push(this.geo_community_areas.data[i].properties.TOTAL_KWH);
				this.hist_community_gas.push(this.geo_community_areas.data[i].properties.TOTAL_THERMS);
			}
		} // TODO for blocks and tracts

	},

	hasBlocks: function(community_id) {
		let self = this;
		for (let i = 0; i < self.geo_community_areas.data.length; i++) {
			if (self.geo_community_areas.data[i].area_num_1 == community_id)
				if (self.geo_community_areas.data[i].geo_blocks == null)
					return false;
				else return true;
		}
		return null;
	},

	setBlocks: function(community_id, results) {
		for (let i = 0; i < this.geo_community_areas.data.length; i++) {
			if (this.geo_community_areas.data[i].area_num_1 == community_id){
				this.geo_community_areas.data[i].geo_blocks = results;
				return;
			}
		}
	}

}