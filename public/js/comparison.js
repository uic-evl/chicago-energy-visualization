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
	this.colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"];

	this.showing = "COMMUNITY_AREAS";
	this.display = "energy";
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

	buildList: function() {
		$("#compare-list-group").children().remove();
		this.addListItem("COMMUNITY_AREAS");
		this.addListItem("CENSUS_TRACTS");
		this.addListItem("CENSUS_BLOCKS");
	},

	addListItem: function(type) {
		let self = this;
		let group = $("#compare-list-group")

		let data = this.communities;
		let title = "Community areas";
		if (type == "CENSUS_TRACTS") { 
			data = this.census_tracts;
			title = "Census tracts";
		} else if (type == "CENSUS_BLOCKS") { 
			data = this.census_blocks;
			title = "Census blocks";		
		}

		let name = "";
		let title_id = "lgi-" + type;

		if (self.showing == type)
			group.append('<li id="' + title_id +'" class="list-group-item active list-group-item-title"><b>' + title + '</b></li>');
		else 
			group.append('<li id="' + title_id +'" class="list-group-item list-group-item-title"><b>' + title + '</b></li>');
		
		$("#" + title_id).click(() => {
			self.update(type);
		});

		for (let i = 0; i < data.length; i++){
			if (type == "CENSUS_BLOCKS")
				name = data[i].id.substring(11, 15);
			else if (type == "CENSUS_TRACTS")
				name = data[i].name.substring(0, data[i].name.length - 2);
			else name = data[i].name;

			if (data[i].belongs_to != null && data[i].belongs_to != undefined){
				name = '<span>' + data[i].initials + '</span>: ' + name;
				tooltip = data[i].belongs_to;
			} else
				tooltip = data[i].name;

			group.append("<li class='list-group-item d-flex justify-content-between align-items-center' title='"+ tooltip + "' >" + name + 
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
			$(group).children().last().css("background-color", () => {
				let index = i % self.colors.length;
				return self.colors[index];
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
				this.buildList();
		} else if (type == "CENSUS_TRACTS") {
			this.census_tracts.splice(pos, 1);
			if (this.census_tracts.length == 0){
				this.empty = true;
				$("#compare-list-group").children().remove();
			} else
				this.buildList();
		} else {
			this.census_blocks.splice(pos, 1);
			if (this.census_blocks.length == 0){
				this.empty = true;
				$("#compare-list-group").children().remove();
			} else
				this.buildList();
		}

		this.update();
		/*
		this.linechart_electricity.data.splice(pos, 1);
		this.linechart_electricity.init();
		this.linechart_gas.data.splice(pos, 1);
		this.linechart_gas.init();
		*/
	},

	add: function(id, name, electricity, gas, type, community_name, area_electricity, area_gas, population) {

		let self = this;
		let exists = false;

		let community = {
				id: id,
				name:name,
				electricity: electricity,
				gas: gas,
				belongs_to: community_name,
				initials: null,
				area_electricity: area_electricity,
				area_gas: area_gas,
				population: population
			};
		if (community.belongs_to != null && community.belongs_to != undefined)
			community.initials = Array.prototype.map.call(community_name.split(" "), function(x){ return x.substring(0,1).toUpperCase();}).join('');

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
			this.buildList();

			if (self.isEmpty()){
				self.init(community.id, community.electricity, community.gas);
				self.empty = false;
			} else {
				this.linechart_electricity.addDataItem(community.id, community.electricity, community.area_electricity, community.population);
				this.linechart_gas.addDataItem(community.id, community.gas, community.area_gas, community.population);

				this.linechart_electricity.display = self.display;
				this.linechart_gas.display = self.display;
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
		
		let data = this.communities;
		if (type == "CENSUS_TRACTS") data = this.census_tracts;
		else if (type == "CENSUS_BLOCKS") data = this.census_blocks;

		if (this.linechart_electricity == null){
			this.linechart_electricity = new LineChart(this.container_electricity, "electricity", null, null);
			this.linechart_gas = new LineChart(this.container_gas, "gas", null, null);
		}

		this.linechart_electricity.data = [];
		this.linechart_gas.data = [];

		for (let i = 0; i < data.length; i++){
			this.linechart_electricity.addDataItem(data[i].id, data[i].electricity, data[i].area_electricity, data[i].population);
			this.linechart_gas.addDataItem(data[i].id, data[i].gas, data[i].area_gas, data[i].population);
		}

		this.linechart_electricity.display = this.display;
		this.linechart_gas.display = this.display;
		this.linechart_electricity.init();
		this.linechart_gas.init();
		this.buildList();

	}


}