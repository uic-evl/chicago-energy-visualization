function Comparison(controller, container_electricity, container_gas) {
	
	this.controller = controller;
	this.container_electricity = container_electricity;
	this.container_gas = container_gas;

	this.empty = true;
	this.linechart_gas = null;
	this.linechart_electricity = null;

	this.communities = [];
	this.census_tracts = [];
	this.census_blocks = [];

	this.showing = "COMMUNITY_AREAS";
}

Comparison.prototype = {
	constructor: Comparison,

	isEmpty: function() {
		return this.empty;
	},

	init: function(id, electricity, gas) {

		let self = this;
		this.linechart_electricity = new LineChart(self.container_electricity, "electricity", electricity, id);
		this.linechart_gas = new LineChart(self.container_gas, "gas", gas, id);

		this.linechart_electricity.init();
		this.linechart_gas.init();
	},

	addListItem: function(type) {
		let self = this;
		$("#compare-list-group").children().remove();
		let group = $("#compare-list-group")

		let data = this.communities;
		if (self.showing == "CENSUS_TRACTS") data = this.census_tracts;
		else if (self.showing == "CENSUS_BLOCKS") data = this.census_blocks;		

		let name = "";
		for (let i = 0; i < data.length; i++){
			if (self.showing == "CENSUS_BLOCKS")
				name = data[i].id.substring(11, 15);
			else name = data[i].name;

			group.append("<li class='list-group-item d-flex justify-content-between align-items-center'>" + name + 
				"<span class='badge'><i class='fa fa-trash-o' aria-hidden='true'></i></span></li>");
			$(group).children().last().children().last().click(() => {
				self.delete(i, type);
			});
			$(group).children().last().mouseenter(() => {
				self.linechart_electricity.highlight(data[i].id);
				self.linechart_gas.highlight(data[i].id);
			});
			$(group).children().last().mouseout(() => {
				self.linechart_electricity.resetHighlight();
				self.linechart_gas.resetHighlight();
			});
		}
	},

	delete: function(pos, type) {
		if (type == "COMMUNITY_AREAS") {
			this.communities.splice(pos, 1);
			if (this.communities.length == 0){
				this.empty = true;
				$("#compare-list-group").children().remove();
			} else
				this.addListItem("COMMUNITY_AREAS");
		} else if (type == "CENSUS_TRACTS") {
			this.census_tracts.splice(pos, 1);
			if (this.census_tracts.length == 0){
				this.empty = true;
				$("#compare-list-group").children().remove();
			} else
				this.addListItem("CENSUS_TRACTS");
		} else {
			this.census_blocks.splice(pos, 1);
			if (this.census_blocks.length == 0){
				this.empty = true;
				$("#compare-list-group").children().remove();
			} else
				this.addListItem("CENSUS_BLOCKS");
		}

		this.linechart_electricity.data.splice(pos, 1);
		this.linechart_electricity.init();
		this.linechart_gas.data.splice(pos, 1);
		this.linechart_gas.init();
		
	},

	add: function(id, name, electricity, gas, type) {

		let self = this;
		let exists = false;

		let community = {
				id: id,
				name:name,
				electricity: electricity,
				gas: gas
			};

		if (type == "COMMUNITY_AREAS"){
			exists = self.included(id, "COMMUNITY_AREAS"); 
			if (!exists)
				self.communities.push(community);
		} else if (type == "CENSUS_TRACTS") {
			exists = self.included(id, "CENSUS_TRACTS"); 
			if (!exists)
				self.census_tracts.push(community);
		} else {
			exists = self.included(id, "CENSUS_BLOCKS"); 
			if (!exists)
				self.census_blocks.push(community);
		}

		if (!exists && type == self.showing) {
			self.addListItem(type);

			if (self.isEmpty()){
				self.init(community.id, community.electricity, community.gas);
				self.empty = false;
			} else {
				this.linechart_electricity.addDataItem(community.id, community.electricity);
				this.linechart_gas.addDataItem(community.id, community.gas);

				this.linechart_electricity.init();
				this.linechart_gas.init();
			}
		}		

	},

	included: function(id, type) {

		let data = this.communities;
		if (type == "CENSUS_TRACTS") data = this.census_tracts;
		else if (type == "CENSUS_BLOCKS") data = this.census_blocks;	

		for (let i = 0; i < data.length; i++)
			if (data[i].id.toString() == id.toString())
				return true;
		return false;

	},

	update: function(type){

		this.showing = type;
		this.linechart_electricity.data = [];
		this.linechart_gas.data = [];

		let data = this.communities;
		if (type == "CENSUS_TRACTS") data = this.census_tracts;
		else if (type == "CENSUS_BLOCKS") data = this.census_blocks;

		for (let i = 0; i < data.length; i++){
			this.linechart_electricity.addDataItem(data[i].id, data[i].electricity);
			this.linechart_gas.addDataItem(data[i].id, data[i].gas);
		}

		this.linechart_electricity.init();
		this.linechart_gas.init();
		this.addListItem(type);

	}


}