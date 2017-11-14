"use strict";

function App() {
	this.area_details = null;
	this.scatterplot = null;

	this.model = null;
}

App.prototype = {

	constructor: App,

	onMapClicked: function(id, type) {
		this.updateAreaDetails(id);
	},

	updateAreaDetails: function(id) {
		let url = "http://localhost:3000/community_consumption/" + id;
		$.getJSON(url, { format: "jsonp" }).done((data) => {
			this.area_details.update(data);
			this.area_details.updateElectricityLineChart();
			this.area_details.updateGasLineChart();
		});
	},

	createScatterplot: function() {
		let data = this.map.data.community_areas;
		this.scatterplot = new ScatterPlot(this, "#scatterplot");
		this.scatterplot.init(data);
	}
};


(function(){
	var app = new App();

let nomoData = [
	{
		Jan: 10,
		Feb: 23,
		Mar: 50,
		May: 6,
		Jun:3,
		Jul:3,
		Aug:3,
		Sep:3,
		Oct:3,
		Nov:3,
		Dec:3
	},
	{
		Jan: 1,
		Feb: 23,
		Mar: 9,
		May: 67,
		Jun:3,
		Jul:3,
		Aug:3,
		Sep:3,
		Oct:3,
		Nov:3,
		Dec:3
	},
	{
		Jan: 11,
		Feb: 65,
		Mar: 32,
		May: 54,
		Jun:3,
		Jul:3,
		Aug:3,
		Sep:3,
		Oct:3,
		Nov:3,
		Dec:3
	},
	{
		Jan: 7,
		Feb: 15,
		Mar: 34,
		May: 6,
		Jun:3,
		Jul:3,
		Aug:3,
		Sep:3,
		Oct:3,
		Nov:3,
		Dec:3
	},
	{
		Jan: 3,
		Feb: 4,
		Mar: 77,
		May: 6,
		Jun:3,
		Jul:3,
		Aug:3,
		Sep:3,
		Oct:3,
		Nov:3,
		Dec:3
	}
];


	var map_height = $( window ).height() - $("#page_header").outerHeight() - $("#map-header").outerHeight() - 15;
	$("#map_overview_detail").height(map_height);
	$("#panel-left").height($("#map-header").outerHeight() - 10);
	init();	

	function init(){

		// Start loading the model
		app.model = new Model();
		console.log("before loading geospatial data");
		let promise1 = app.model.loadGeospatialData("COMMUNITY_AREAS");
		promise1.done(() => {
			console.log("after loading geospatial data");
		});


		app.map = new EnergyMap("map_overview_detail", app, "overview", "NEAR WEST SIDE");
		app.map.init();	
		setViewButtons();

		let community = {
			NAME: "Near North Side",
			TOTAL_KWH: 5000,
			TOTAL_THERMS: 5060,
			electricity:[1,2,3,4,5,6,7,8,9,10,11,12],
			gas:[1,2,3,4,5,6,7,8,9,10,11,12],
			TOTAL_POPULATION: 135304,
			TOTAL_UNITS: 7600,
			OCCUPIED_UNITS: 3402,
			KWH_TOTAL_SQFT: 12324,
			THERM_TOTAL_SQFT: 4433
		};
		app.area_details = new AreaDetails("area_details", "area_details_container", community);
		app.area_details.init();
		app.area_details.updateElectricityLineChart();
		app.area_details.updateGasLineChart();
		app.area_details.updateRankingPCP();

		let nomogramPanel = new NomogramPanel("nomogram_ranking", nomoData);
		nomogramPanel.init();

		app.createScatterplot();

		// tract id test: 250300
		//let mini_map = new EnergyMap("mini_map", app);
		//mini_map.filters.detail = "census_blocks";
		//mini_map.init(250300);
	}

	function setViewButtons() {
		$('.dd-scale li > a').click((e) => {
			let scale = e.currentTarget.innerText;
			$('#dd-scale').text(e.currentTarget.innerText);
			app.map.onScaleChange(scale);
		});

		$('.dd-area li > a').click((e) => {
			let area_level = e.currentTarget.innerText;
			$('#dd-area').text(e.currentTarget.innerText);
			app.map.onAreaLevelChange(area_level);
		});

		$('.dd-energy li > a').click((e) => {
			let energy = e.currentTarget.innerText;
			$('#dd-energy').text(energy);
			app.map.onEnergyChange(energy);
		});
	}
})();