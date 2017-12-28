"use strict";

var SERVER = "http://localhost";

function App() {
	this.area_details = null;
	this.scatterplot = null;
	this.comparison = null;

	this.model = null;

	this.layerHighlightedMinimap = null;
}

App.prototype = {

	constructor: App,

	onMapClicked: function(id, type) {
		if (type == "overview"){
			this.updateAreaDetails(id);
		}
	},

	updateAreaDetails: function(id) {

		let self = this,
			old_id = "";
		if (self.area_details != null && self.area_details.data != null)
			old_id = this.area_details.data.id;

		if (old_id != id) {
			let url = SERVER + ":3000/community_consumption/" + id;
			$.getJSON(url, { format: "jsonp" }).done((data) => {

				var consumption = data;
				consumption.id = id;

				this.area_details.update(consumption);
				this.area_details.updateElectricityLineChart();
				this.area_details.updateGasLineChart();
				this.histogramElectricity.community = consumption.NAME;
				this.histogramGas.community = consumption.NAME;
				this.histogramElectricity.updateLine(consumption.TOTAL_KWH);
				this.histogramGas.updateLine(consumption.TOTAL_THERMS);

				$("#community-consumption").text("Consumption in " + consumption.NAME);
				$("#community-distribution").text("Communities Distribution");
				$("#community-buildings").text("Buildings in " + consumption.NAME);
				$("#community-map").text("Map Explorer of " + consumption.NAME);

				let url2 = SERVER + ":3000/buildings/" + id;
				$.getJSON(url2, { format: "jsonp" }).done((buildings) => {
					let words = this.getWords(buildings);
					this.loadWordCloud2(words);
				});
			});
		}
	},

	addCommunityComparisonData: function() {
		
		let data = this.area_details.data;
		let area1 = this.map.minimap.selectedLayer.feature.properties.AREA_ELECTRICITY;
		let area2 = this.map.minimap.selectedLayer.feature.properties.AREA_GAS;
		this.comparison.add(data.id, data.NAME, data.electricity, data.gas, "COMMUNITY_AREAS", null, area1, area2, data.TOTAL_POPULATION);
		
	},

	addComparisonData: function(type, id) {

		if (type == "COMMUNITY_AREAS")
			this.addCommunityComparisonData(); 
		else {
			let url = SERVER + ":3000";
			if (type == "CENSUS_TRACTS"){
				url = url + "/tract_consumption/" + id;
			}
			else {  
				url = url + "/block_consumption/" + id;
			}	

			$.getJSON(url, { format: "jsonp" }).done((data) => {
				let community_name = $("#selected-community-name").text();
				let area1 = this.map.selectedLayer.feature.properties.AREA_ELECTRICITY;
				let area2 = this.map.selectedLayer.feature.properties.AREA_GAS;
				this.comparison.add(data.ID, data.NAME, data.electricity, data.gas, type, community_name, area1, area2, data.TOTAL_POPULATION);
			});
		}

		if (this.comparison.showing != type){
			this.comparison.update(type);
		}

	},

	createScatterplot: function() {
	
		let data = this.model.geo_community_areas.data;
		this.scatterplot = new ScatterPlot(this, "#scatterplot", "TOTAL_KWH", "TOTAL_THERMS", "population");
		this.scatterplot.init(data);
	
	},

	updateScatterplot: function(type) {

		let data = this.model.geo_community_areas.data;
		if (type == "CENSUS_TRACTS" || type == "CENSUS_BLOCKS")
			data = this.model.selected_area.data;
		this.scatterplot.update(data, type);

	},

	getCensusTractsGeoData: function(id) {

		return new Promise((resolve, reject) => {
			if (id == null) {
				if (this.model.geo_census_tracts == null){
					let promise = this.model.loadGeospatialData("CENSUS_TRACTS", null);
					promise.done(() => { resolve(this.model.geo_census_tracts); });
				}
			} else {
				let promise = this.model.loadGeospatialData("CENSUS_TRACTS", id);
				promise.done(() => { 
					resolve(this.model.selected_area); });
			}
		});

	},

	getCensusBlockGeoData: function(community_id) {

		return new Promise((resolve, reject) => {
			let promise = this.model.loadGeospatialData("CENSUS_BLOCKS", community_id);
			promise.done(() => {
				resolve(this.model.selected_area);
			});
		});

	},

	highlightMinimap: function(communityName) {

		this.layerHighlightedMinimap = this.map.minimap.getLayerByName(communityName);
		this.map.minimap.highlightFeature(this.layerHighlightedMinimap);

	},

	highlightDetailsMap: function (geoid) {

		this.layerHighlightedDetails = this.map.getLayerByGeoId(geoid);
		this.map.highlightFeature(this.layerHighlightedDetails);

	},

	resetHighlightMinimap: function() {

		this.map.minimap.resetHighlight(this.layerHighlightedMinimap);

	},

	resetHighlightDetailsMap: function() {

		this.map.resetHighlight(this.layerHighlightedDetails);

	},

	selectScatterplotItem: function(name) {

		let layer = null;
		if (this.scatterplot.level == "COMMUNITY_AREAS"){
			layer = this.map.minimap.getLayerByName(name);
			this.map.minimap.selectLayer(layer);
		} else {
			layer = this.map.getLayerByGeoId(name);
			this.map.selectLayer(layer);
		}		

	},

	highlightScatterplot: function(id, sender) {

		if (this.scatterplot.level == sender)
			this.scatterplot.highlightElement(id);
		else {
			this.updateScatterplot(sender);
			this.scatterplot.highlightElement(id);

			let label = "";
			if (sender == "CENSUS_BLOCKS")
				label = "census blocks";
			else if (sender == "CENSUS_TRACTS")
				label = "census tracts";
			else if (sender == "COMMUNITY_AREAS")
				label = "community areas";
			$('#dd-scatterplot-detail').text(label);
		}

	},

	resetHightlightScatterplot: function() {

		this.scatterplot.resetHighlight();

	},

	selectMinimapItem: function(communityName) {
		this.scatterplot.addSelectedElementStyle(communityName, "COMMUNITY_AREAS");
	},

	selectOverviewmapItem: function(geoid, sender) {
		this.scatterplot.addSelectedElementStyle(geoid, sender);
	},

	getWords: function(d){
		let words = [
			{ "key": "residential", "value": d.building.RESIDENTIAL },
			{ "key": "office", "value": d.building.OFFICE },
			{ "key": "recreational", "value": d.building.RESIDENTIAL },
			{ "key": "medical", "value": d.building.MEDICAL },
			{ "key": "government", "value": d.building.GOVERNMENT },
			{ "key": "industrial", "value": d.building.INDUSTRIAL },
			{ "key": "green", "value": d.building.GREEN },
			{ "key": "vacant", "value": d.building.VACANT },
			{ "key": "water", "value": d.building.WATER },
			{ "key": "utilities", "value": d.building.UTILITIES },
		]

		return words;
	},

	loadWordCloud2: function(words) {

		let tags = words;
		d3.select("#selected-word-cloud").select("svg").remove();

		let w = $("#selected-word-cloud").width();
		let h = $("#selected-word-cloud").height();

		let fill = d3.scaleOrdinal(d3.schemeCategory20);
		var fontSize = null;
		var scale = null;

		var layout = d3.layout.cloud()
        	.timeInterval(Infinity)
        	.size([w, h])
        	.fontSize(function(d) {
            	return fontSize(+d.value);
        	})
        	.text(function(d) {
            	return d.key;
       		})
       		.rotate(function(d) { return 0; })
        	.on("end", draw);

        var svg = d3.select("#selected-word-cloud").append("svg")
        			.attr("width", w)
        			.attr("height", h);

		var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");
		update();

		function draw(data, bounds) {
		    //var w = window.innerWidth,
		      //  h = window.innerHeight;
		    let w = $("#selected-word-cloud").width();
			let h = $("#selected-word-cloud").height();


		    svg.attr("width", w).attr("height", h);

		    scale = bounds ? Math.min(
		            w / Math.abs(bounds[1].x - w / 2),
		            w / Math.abs(bounds[0].x - w / 2),
		            h / Math.abs(bounds[1].y - h / 2),
		            h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

		    var text = vis.selectAll("text")
		            .data(data, function(d) {
		                return d.text.toLowerCase();
		            });
		    text.transition()
		            .duration(1000)
		            .attr("transform", function(d) {
		                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		            })
		            .style("font-size", function(d) {
		                return d.size + "px";
		            });

		    text.enter().append("text")
		            .attr("text-anchor", "middle")
		            .attr("transform", function(d) {
		                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		            })
		            .style("font-size", function(d) {
		                return d.size + "px";
		            })
		            .style("opacity", 1e-6)
		            .transition()
		            .duration(1000)
		            .style("opacity", 1)
		            .style("font-family", function(d) {
		        		return d.font;
		    		})
		            .style("fill", function(d) {
		                return fill(d.text.toLowerCase());
		            })
		            .text(function(d) {
		                return d.text;
		            });

		    //vis.transition().attr("scale(" + scale + ")");
		    vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
		}

		function update() {
		    layout.font('impact').spiral('archimedean');
		    fontSize = d3.scaleSqrt().range([10, 30]);
		    if (tags.length){
		    	let min = d3.min(tags, function(d) { return +d.value;} );
		    	let max = d3.max(tags, function(d) { return +d.value;} );
		        fontSize.domain([min, max]);
		    }
		    layout.stop().words(tags).start();
		}

	},

	loadWordCloud: function(words) {

		console.log(words);

		d3.select("#selected-word-cloud").select("svg").remove();

		let w = $("#selected-word-cloud").width();
		let h = $("#selected-word-cloud").height()

		let fill = d3.scaleOrdinal(d3.schemeCategory20);
		let layout = d3.layout.cloud()
		    .size([w, h])
		    .words(words.map(function(d) {
		      return {text: d, size: 10 + Math.random() * 30, test: "haha"};
		    }))
		    .padding(5)
		    .rotate(function() { return ~~(Math.random() * 2) * 90; })
		    .font("'Open Sans', sans-serif")
		    .fontSize(function(d) { return d.size; })
		    .on("end", draw);	
		layout.start();

		function draw(words) {
		  d3.select("#selected-word-cloud").append("svg")
		      .attr("width", layout.size()[0])
		      .attr("height", layout.size()[1])
		    .append("g")
		      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
		    .selectAll("text")
		      .data(words)
		    .enter().append("text")
		      .style("font-size", function(d) { return d.size + "px"; })
		      .style("font-family", "'Open Sans', sans-serif")
		      .style("fill", function(d, i) { return fill(i); })
		      .attr("text-anchor", "middle")
		      .attr("transform", function(d) {
		        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
		      })
		      .text(function(d) { return d.text; });
		}		
	}

};


(function(){
	var app = new App();

	var map_height = $( window ).height() - $("#page_header").outerHeight() - $("#map-header").outerHeight() - 15;
	$("#map_overview_detail").height(map_height);
	$("#panel-left").height($("#map-header").outerHeight() - 10);
	init();	

	function init(){

		// Start loading the model
		app.model = new Model();
		let promise1 = app.model.loadGeospatialData("COMMUNITY_AREAS");
		promise1.done(() => {
			app.map = new EnergyMap("map_overview_detail", app, "detail", "NEAR WEST SIDE");
			app.map.init(app.model.geo_community_areas);
			app.createScatterplot();

			let community = null;
			for (let i = 0; i < app.model.geo_community_areas.data.length; i++){
				if (app.model.geo_community_areas.data[i].properties.community == "NEAR WEST SIDE"){					
					community = app.model.geo_community_areas.data[i].properties;
					community.NAME = app.model.geo_community_areas.data[i].properties.community;
				}
			}

			app.selectScatterplotItem(community.NAME);
			app.area_details = new AreaDetails("area_details", "area_details_container", null);
			app.updateAreaDetails(28);

			let hElecTitle = "electricity in kWh";
			let hGasTitle  = "gas in thm";

			app.histogramElectricity = new Histogram("selected-histogram-electricity", app, app.model.hist_community_electricity, hElecTitle, community.NAME);
			app.histogramGas = new Histogram("selected-histogram-gas", app, app.model.hist_community_gas, hGasTitle, community.NAME);

			app.histogramElectricity.init();
			app.histogramElectricity.updateLine(community.TOTAL_KWH);
			app.histogramGas.init();
			app.histogramGas.updateLine(community.TOTAL_THERMS);

			app.comparison = new Comparison(app, "linechart-comparison-electricity", "linechart-comparison-gas");

		});

		setViewButtons();
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

			let filter = energy;
			let comparison_display = "";
			if (energy == "electricity (total)"){
				filter = "TOTAL_KWH";
				comparison_display = "energy";	
			}  else if (energy == "gas (total)") {
				filter = "TOTAL_THERMS"; 
				comparison_display = "energy";
			} else if (energy == "kwh sqft") {
				filter = "KWH_TOTAL_SQFT";
				comparison_display = "energy_per_sqft";
			} else if (energy == "thm sqft") {
				filter = "THERMS_TOTAL_SQFT";
				comparison_display = "energy_per_sqft";
			}  else if (energy == "kwh sqmt") {
				filter = "KWH_TOTAL_SQMETERS";
				comparison_display = "energy_per_m2";
			} else if (energy == "thm sqmt") { 
				filter = "THERMS_TOTAL_SQMETERS";
				comparison_display = "energy_per_m2";
			} else if (energy == "electricity per capita") {
				filter = "KWH_TOTAL_CAPITA";
				comparison_display = "energy_per_capita";
			} else if (energy == "gas per capita") {
				filter = "THERMS_TOTAL_CAPITA";
				comparison_display = "energy_per_capita";	
			} 

			$('#dd-energy').text(energy);
			app.comparison.display = comparison_display;
			app.map.onEnergyChange(filter);

			if (app.comparison.linechart_electricity != null) {
				app.comparison.update(app.comparison.showing);
			}
		});

		$('.dd-scatterplot-x li > a').click((e) => {
			let x_name = e.currentTarget.innerText;
			$('#dd-scatterplot-x').text(e.currentTarget.innerText);
			app.scatterplot.changeXAxis(app.scatterplot.getImplName(x_name));
		});

		$('.dd-scatterplot-y li > a').click((e) => {
			let y_name = e.currentTarget.innerText;
			$('#dd-scatterplot-y').text(e.currentTarget.innerText);
			app.scatterplot.changeYAxis(app.scatterplot.getImplName(y_name));
		});

		$('.dd-scatterplot-r li > a').click((e) => {
			let r_name = e.currentTarget.innerText;
			$('#dd-scatterplot-r').text(e.currentTarget.innerText);
			app.scatterplot.changeProperty(app.scatterplot.getImplName(r_name));
		});

		$('.dd-scatterplot-scale li > a').click((e) => {
			let scale = e.currentTarget.innerText;
			$('#dd-scatterplot-scale').text(e.currentTarget.innerText);
			app.scatterplot.changeScale(scale);
		});

		$('.dd-scatterplot-detail li > a').click((e) => {
			let detail = e.currentTarget.innerText;
			if (detail == "census blocks")
				detail = "CENSUS_BLOCKS";
			else if (detail == "census tracts")
				detail = "CENSUS_TRACTS";
			else if (detail == "community areas")
				detail = "COMMUNITY_AREAS";
			$('#dd-scatterplot-detail').text(e.currentTarget.innerText);
			app.updateScatterplot(detail);
		});

		$("#temp_button").click(() => {
			app.addCommunityComparisonData();
		});


		$('.dd-comparison li > a').click((e) => {
			let detail = e.currentTarget.innerText;
			if (detail == "census blocks")
				detail = "CENSUS_BLOCKS";
			else if (detail == "census tracts")
				detail = "CENSUS_TRACTS";
			else if (detail == "community areas")
				detail = "COMMUNITY_AREAS";
			$('#dd-comparison').text(e.currentTarget.innerText);

			app.comparison.update(detail);
		});
	}
})();