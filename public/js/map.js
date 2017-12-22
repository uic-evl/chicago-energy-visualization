'use strict';

// Create globals so leaflet can load
function EnergyMap(container_id, controller, type, default_selection){

	this.controller = controller;			// App controller
	this.container_id = container_id;
	this.legend_id = null;
	this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
	this.height = 0;
	this.width = 0;
	this.type = type; 	// overview/detail
	this.default_selection = default_selection;

	this.map = null;	// Leaflet map
	this.minimap = null;
	this.parent = null;			// Access to the object that contains minimap
	//this.center = {'lat': 41.8500350, 'lng': -87.60};
	this.center = {'lat': 41.8500350, 'lng': -87.66};
	this.zoomLevel = 11;
	this.selectedLayer = null;
	this.preHighlightColor = null;
	this.selectedColor = null;

	this.svg = null;
	this.svg_g = null;
	this.geoJsonLayer = null;
	this.scale = null;

	this.filters = {
		data2display: "TOTAL_KWH",
		detail: "census_tracts",
		scale: "real"
	};
	this.legend = {
		min: 0,
		max: 0,
		avg: 0
	};
	this.data = {
		'community_areas': null,
		'tracts': null,
	};
	this.brewer = {
		min: "#91bfdb",
		avg: "#ffffbf",
		max: "#fc8d59"
	};

	// Detail map: census track or block; Overview: community
	this.selectedId = null;

	this.scales = {
		    'puOr11': ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
		    'spectral8': ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'],
		    'redBlackGreen': ['#ff0000', '#AA0000', '#550000', '#005500', '#00AA00', '#00ff00'],
		    'viridis': ["#440154","#440256","#450457","#450559","#46075a","#46085c","#460a5d","#460b5e","#470d60","#470e61","#471063","#471164","#471365","#481467","#481668","#481769","#48186a","#481a6c","#481b6d","#481c6e","#481d6f","#481f70","#482071","#482173","#482374","#482475","#482576","#482677","#482878","#482979","#472a7a","#472c7a","#472d7b","#472e7c","#472f7d","#46307e","#46327e","#46337f","#463480","#453581","#453781","#453882","#443983","#443a83","#443b84","#433d84","#433e85","#423f85","#424086","#424186","#414287","#414487","#404588","#404688","#3f4788","#3f4889","#3e4989","#3e4a89","#3e4c8a","#3d4d8a","#3d4e8a","#3c4f8a","#3c508b","#3b518b","#3b528b","#3a538b","#3a548c","#39558c","#39568c","#38588c","#38598c","#375a8c","#375b8d","#365c8d","#365d8d","#355e8d","#355f8d","#34608d","#34618d","#33628d","#33638d","#32648e","#32658e","#31668e","#31678e","#31688e","#30698e","#306a8e","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#2e6f8e","#2d708e","#2d718e","#2c718e","#2c728e","#2c738e","#2b748e","#2b758e","#2a768e","#2a778e","#2a788e","#29798e","#297a8e","#297b8e","#287c8e","#287d8e","#277e8e","#277f8e","#27808e","#26818e","#26828e","#26828e","#25838e","#25848e","#25858e","#24868e","#24878e","#23888e","#23898e","#238a8d","#228b8d","#228c8d","#228d8d","#218e8d","#218f8d","#21908d","#21918c","#20928c","#20928c","#20938c","#1f948c","#1f958b","#1f968b","#1f978b","#1f988b","#1f998a","#1f9a8a","#1e9b8a","#1e9c89","#1e9d89","#1f9e89","#1f9f88","#1fa088","#1fa188","#1fa187","#1fa287","#20a386","#20a486","#21a585","#21a685","#22a785","#22a884","#23a983","#24aa83","#25ab82","#25ac82","#26ad81","#27ad81","#28ae80","#29af7f","#2ab07f","#2cb17e","#2db27d","#2eb37c","#2fb47c","#31b57b","#32b67a","#34b679","#35b779","#37b878","#38b977","#3aba76","#3bbb75","#3dbc74","#3fbc73","#40bd72","#42be71","#44bf70","#46c06f","#48c16e","#4ac16d","#4cc26c","#4ec36b","#50c46a","#52c569","#54c568","#56c667","#58c765","#5ac864","#5cc863","#5ec962","#60ca60","#63cb5f","#65cb5e","#67cc5c","#69cd5b","#6ccd5a","#6ece58","#70cf57","#73d056","#75d054","#77d153","#7ad151","#7cd250","#7fd34e","#81d34d","#84d44b","#86d549","#89d548","#8bd646","#8ed645","#90d743","#93d741","#95d840","#98d83e","#9bd93c","#9dd93b","#a0da39","#a2da37","#a5db36","#a8db34","#aadc32","#addc30","#b0dd2f","#b2dd2d","#b5de2b","#b8de29","#bade28","#bddf26","#c0df25","#c2df23","#c5e021","#c8e020","#cae11f","#cde11d","#d0e11c","#d2e21b","#d5e21a","#d8e219","#dae319","#dde318","#dfe318","#e2e418","#e5e419","#e7e419","#eae51a","#ece51b","#efe51c","#f1e51d","#f4e61e","#f6e620","#f8e621","#fbe723","#fde725"]
		};

	this.initial_load = true;
};

EnergyMap.prototype = {
	constructor: EnergyMap,

	init: function(communityData){

			var self = this;
			self.createLeafletMap();
			self.createButtonsPanel();

			if (self.type == "detail"){
				self.data.community_areas = communityData;
				self.createMiniMapPanel();
				self.miniMapPanel.update(communityData);

				self.minimap.selectedId = self.minimap.getLayerId(self.default_selection) 
				self.display(self.minimap.selectedId);
				self.default_selection = null;
			}
	},

	createLeafletMap: function(){
		var self = this;

		// do not recreate the map for the mini map
		if (!self.map){
			self.map = new L.map(self.container_id);
			var osmUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
	      	osmAttrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
	          					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	          					'Imagery © <a href="http://mapbox.com">Mapbox</a>';
	      	
	        if (self.type == "overview"){
	        	osmAttrib = "";	
	        	if ($("#" + self.container_id).width() > 440)
	        		self.zoomLevel = 11;
	        	else
	        		self.zoomLevel = 9;
	        }
	        else{
	        	self.zoomLevel = 4;
	        	self.initial_load = false;
	        }
	        
	      	let osm = new L.TileLayer(osmUrl,
	          {   
	          	  attribution: osmAttrib,
	              minZoom: 1,
	              id:'mapbox.light',
	              accessToken: 'pk.eyJ1IjoianRyZWxsMiIsImEiOiJjaXZpamo1NngwMTlpMnpvNndjeWR0NzhmIn0.2-3ieO-fWXW0Zr0KGWz6XA'
	          });	

		    self.map.setView([self.center.lat, self.center.lng], self.zoomLevel);
		    self.map.addLayer(osm);
		    self.map.zoomControl.setPosition("bottomleft");
		}

	    return self;		
	},

	addData2: function(data){

		let self = this;
		self.setLegendValues(data);

		if (self.geoJsonLayer != null)
			self.geoJsonLayer.clearLayers();

		self.geoJsonLayer = L.geoJSON(data.data, {
				style: function(feature){ return self.setGeoJSONStyle(feature);},
				onEachFeature: function(feature, layer) { 
					self.onEachFeature(feature, layer);
				}
			}).addTo(self.map);
		self.createLegend2();

		if (!self.initial_load){
			let bounds = self.geoJsonLayer.getBounds();
			self.map.fitBounds(bounds);
		} else {
			self.initial_load = false;
		}

		if (self.default_selection) {
			self.selectLayer(self.getLayerByName(self.default_selection));
			self.default_selection = null;
		}	

		if (self.type == "overview" && self.selectedId) {
			let layer = self.getLayerById(self.selectedId);
			self.selectLayer(layer);
			//self.updateLayerStyle(self.selectedLayer, false);
		}
	},

	onEachFeature: function(feature, layer){
		let self = this,
			f = d3.format(","),
			f2 = d3.format(",.2f"),
			details = "";

		if (self.type == "detail"){
			if (feature.properties) {

				if (feature.properties.ANONYMOUS != null && feature.properties.ANONYMOUS == true)
					details = "<div><span class='popup-label'>Area number: </span><span class='popup-value'>" + feature.properties.name10 + "</span></div>" +
							  "<div><span class='popup-label'>Data not available</span></div>";
				else
					details = "<div><span class='popup-label'>Area number: </span><span class='popup-value'>" + feature.properties.name10 + "</span></div><hr/>" +
							  "<div><span class='popup-label'>Electricity: </span><span class='popup-value'>" + getDisplayValue(feature.properties.TOTAL_KWH, f) + " kWh</span></div>" +
							  "<div><span class='popup-label'>Gas: </span><span class='popup-value'>" + getDisplayValue(feature.properties.TOTAL_THERMS, f) + " thm</span></div><hr/>" +
							  "<div><span class='popup-label'>Population: </span><span class='popup-value'>" + f(feature.properties.POPULATION) + "</span></div>" +
							  "<div><span class='popup-label'>Total Units: </span><span class='popup-value'>" + f(feature.properties.TOTAL_UNITS) + "</span></div>" +
							  "<div><span class='popup-label'>Occupied Units: </span><span class='popup-value'>" + f(feature.properties.OCCUPIED_HOUSING_UNITS) + "</span></div><hr/>" +
							  "<div><span class='popup-label'>kWh sqft: </span><span class='popup-value'>" + getDisplayValue(feature.properties.KWH_TOTAL_SQFT, f2) + "</span></div>" +
							  "<div><span class='popup-label'>thm sqft: </span><span class='popup-value'>" + getDisplayValue(feature.properties.THERMS_TOTAL_SQFT, f2) + "</span></div><hr/>" +
							  "<div><span class='popup-label'>kWh m2: </span><span class='popup-value'>" + getDisplayValue(feature.properties.KWH_TOTAL_SQMETERS, f2) + "</span></div>" +
							  "<div><span class='popup-label'>thm m2: </span><span class='popup-value'>" + getDisplayValue(feature.properties.THERMS_TOTAL_SQMETERS, f2) + "</span></div><hr/>" +
							  "<div><span class='popup-label'>kWh per capita: </span><span class='popup-value'>" + getDisplayValue(feature.properties.KWH_TOTAL_CAPITA, f2) + "</span></div>" +
							  "<div><span class='popup-label'>thm per capita: </span><span class='popup-value'>" + getDisplayValue(feature.properties.THERMS_TOTAL_CAPITA, f2) + "</span></div><br/>" +
							  "<div><button type='button' class='btn btn-primary btn-sm button-add'>Add to comparison</button></div>";
							  //"<div class='button-add'><span><i class='fa fa-plus-circle' aria-hidden='true'></i></span></div>";
							  //"<div><span class='popup-label'>community: </span><span class='popup-value'>" + feature.properties.COMMUNITY_AREA_ID + "</span></div><br/>" 
    		}
		} else {
			details = "<div><span class='popup-label'>" + feature.properties.community + "</span></div><br/>" +
					   "<div><button type='button' class='btn btn-primary btn-sm button-add-area'>Add to comparison</button></div>";
		}
		layer.bindPopup(details);
    	
		layer.on({
			click: function(e){self.whenClicked(e);}, 
			mouseover: function(e){self.highlightFeature(e.target);},
			mouseout: function(e){self.resetHighlight(e.target);}
		});

		function getDisplayValue(num, fmt) {
			if (isNaN(num) || num == -1)
				return "N/A";
			else {
				return fmt(num);
			}
		}
	},

	whenClicked: function(e){
		let self = this;
		let layer = e.target;
		if (this.type == "detail"){
			this.selectLayer(layer);
			layer.openPopup();	
			
			$(".button-add").on("click", () => {
				let id = layer.feature.properties.tractce10;
				if (self.filters.detail == "census_blocks")
					id = layer.feature.properties.geoid10;
				self.controller.addComparisonData(self.filters.detail.toUpperCase(), id);
			});

		} else {
			$(".button-add-area").on("click", () => {
				let id = layer.feature.properties.area_numbe;
				self.controller.addComparisonData("COMMUNITY_AREAS", id);
			});

			this.selectLayer(layer);
			this.parent.selectedLayer = null;
		}
	},

	getLayerId: function(layerName) {
		let layer = this.getLayerByName(layerName);
		return layer.feature.properties.area_numbe;
	},

	updateLayerStyle: function(layer){
		let self = this;
		if (self.selectedLayer)
			self.geoJsonLayer.resetStyle(self.selectedLayer);
		self.selectedLayer = layer;
		self.geoJsonLayer.resetStyle(layer);

		if (self.preHighlightColor)
			self.selectedColor = self.preHighlightColor;
		else
			self.selectedColor = layer.options.color; 

		self.selectedLayer.setStyle({ 
			weight: 5, 
			color: 'black', 
			dashArray: '',
			fillColor: self.selectedColor
		});
		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        	self.selectedLayer.bringToFront();
    	}		
	},

	selectLayer: function(layer){
		let self = this;
		let id = layer.feature.properties.area_numbe;

		self.updateLayerStyle(layer);
    	// Update the Selected Area Information Panel
		self.controller.onMapClicked(id, self.type);
		// Update content on parent map
		
		if (self.type == "overview" && self.default_selection == null){
			self.selectedId = id;
			self.parent.display(id);
			self.controller.selectMinimapItem(layer.feature.properties.community);
		} else if (self.default_selection == null){
			self.controller.selectOverviewmapItem(layer.feature.properties.geoid10, self.filters.detail.toUpperCase());
		}
	},

	highlightFeature: function(layer){
		let self = this;

		if (layer != self.selectedLayer){
			self.preHighlightColor = layer.options.color;
			layer.setStyle({
				weight: 2,
				color: 'black',
				fillColor: self.preHighlightColor, 
				dashArray: '5,5'
			});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge)
	        	layer.bringToFront();

	        if (self.type == "overview")
	        	self.controller.highlightScatterplot(layer.feature.properties.community, "COMMUNITY_AREAS");
	        else {
	        	self.controller.highlightScatterplot(layer.feature.properties.geoid10, self.filters.detail.toUpperCase());
	        }
		}
	},

	resetHighlight: function(layer) {
		let self = this;
		if (self.selectedLayer != layer){
			self.geoJsonLayer.resetStyle(layer);
			
			self.controller.resetHightlightScatterplot();
		}

		if (self.selectedLayer){
			self.selectedLayer.setStyle({ 
				weight: 5, 
				color: 'black', 
				dashArray: '',
				fillColor: self.selectedColor
			});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge)
        		self.selectedLayer.bringToFront();
		}
	},

	setLegendValues: function(data){

		let self = this;
		let total_population = 0;
		let filter = self.filters.data2display;

		if (self.filters.data2display.includes("capita")){
			let min = Number.MAX_VALUE;
			let max = 0;

			if (filter.includes("gas")) filter = "TOTAL_THERMS";
			else if (filter.includes("electricity")) filter = "TOTAL_KWH";

			let val;
			for (let i = 0; i < data.data.length; i++){
				if (data.data[i].properties.POPULATION > 0)
					val = data.data[i].properties[filter] / data.data[i].properties.POPULATION;
				else
					val = 0;
				if (val > max) max = val;
				if (val < min) min = val;
			}

			self.legend.min = min;
			self.legend.max = max;
			self.legend.avg = 0;

			if (self.filters.scale != "real"){
				self.legend.min = Math.log(self.legend.min);
				self.legend.max = Math.log(self.legend.max);
			}

		} else {
			if (self.filters.scale == 'real'){
				self.legend.min = data[filter].min;
				self.legend.max = data[filter].max;
				self.legend.avg = data[filter].avg;
			} else {
				self.legend.min = Math.log(data[filter].min);
				self.legend.max = Math.log(data[filter].max);
				self.legend.avg = Math.log(data[filter].avg);	
			};
		}		
		
		
		self.createScale();


	},

	setGeoJSONStyle: function(feature){
		let self = this,
			field = self.filters.data2display;
		if (field == "electricity") field = "TOTAL_KWH";
		else if (field == "gas") field = "TOTAL_THERMS";

		let anonymous = feature.properties["ANONYMOUS"];
		let value = feature.properties[field];
		if (self.filters.data2display.includes('capita'))
			value = value / feature.properties.POPULATION;

		if (anonymous)	// data was aggregated
			return { color: "grey", fillOpacity: 0.6, className: "map-area" };
		else {
			if (self.filters.scale == "logarithmic")
			value = Math.log(value);

			let color = self.scale(value);
			return { color: color, fillOpacity: 0.6, className: "map-area" };
		}
		
	},

	loadCommunityAreas: function(){

		if (this.geoJsonLayer != null) this.clear();
		this.addData2(this.data.community_areas);
	
	},

	loadCensusTracts: function(id) {
		
		if (this.geoJsonLayer != null) this.clear();
		this.controller.getCensusTractsGeoData(id)
			.then((data)=>{ this.addData2(data); });
		
	},

	loadCensusBlock: function(community_id) {
		
		if (this.geoJsonLayer != null) this.clear();
		this.controller.getCensusBlockGeoData(community_id)
			.then((data) => { 
				this.addData2(data); 
			});

	},

	clear: function(){
		this.geoJsonLayer.clearLayers();
	},

	createButtonsPanel: function() {
		let self = this;
		//let view_model = self.getPanelDataBinding();

		self.legend_id = "overview_legend_container";
		if (self.type == "detail")
			self.legend_id = "details_legend_container";
		self.map.buttons_panel = L.control({ position: 'topright' });

		self.map.buttons_panel.onAdd = (leaflet_map) => {
			this._div = L.DomUtil.create('div', self.legend_id);
            //$(this._div).load("./view/ButtonsPanel.html", (data) => { ko.applyBindings(view_model);});
            return this._div;
		};
		
		self.map.buttons_panel.addTo(self.map);
		$("." + self.legend_id).attr("id", self.legend_id);
	},

	onFilterChange: function(filter, value){
		let self = this;
		if (self.filters[filter] != value){
			self.filters[filter] = value;

			if (filter == "detail") {
				self.display();
			} else {
				self.minimap.filters[filter] = value;
				self.minimap.display();
			}
		}
	},

	onEnergyChange: function(energy){
		this.onFilterChange("data2display", energy);
	},

	onAreaLevelChange: function(area_level){
		if (area_level == "census tracts")
			area_level = "census_tracts";
		else if (area_level == "census blocks")
			area_level = "census_blocks";
		this.onFilterChange("detail", area_level);
	},

	onScaleChange: function(scale){
		this.onFilterChange("scale", scale);
	},

	display: function(){
		var self = this;

		if (self.filters.detail == "community_areas")
			self.loadCommunityAreas();
		else if (self.filters.detail == "census_tracts")
			self.loadCensusTracts(self.minimap.selectedId); 
		else if (self.filters.detail == "census_blocks")
			self.loadCensusBlock(self.minimap.selectedId);
	},

	createLegend: function(){
		let self = this;

		//let width = $(self.legend_id).parent().width() * 0.95,
		let height = 200,
			divisions = height,
			fake_data = [],
			increment = self.legend.max / divisions;

		if (self.filters.scale == 'log') {
			divisions = Math.floor(self.legend.max - self.legend.min + 1);
			increment = 1;
		}

		let	rect_height = Math.floor(height/divisions);
		for (let i = self.legend.max; i > self.legend.min; i -= increment)
			fake_data.push(i);

		d3.select("#" + self.legend_id).select("svg").remove();
		let svg = d3.select("#" + self.legend_id).append("svg")
			.attr("width", 50)
			.attr("height", height);	//TODO make this dynamic

		let legend = svg.append("g").attr("class", "YesLegend");
		legend.selectAll("rect")
                .data(fake_data)
                .enter()
                .append("rect")
                .attr("x", 5)
                .attr("y", function (d, i) { return i * rect_height; })
                .attr("height", rect_height)
                .attr("width", 15)
                .attr("fill", function (d) { return self.scale(d)})
                .attr("stroke-width", 0);

        var f = d3.format(",.2f");
        svg.append("text")
            .text(function() { return f((self.legend.max));})
            .style("text-anchor", "start")
            .style("fill", "black")
            .attr("transform", "translate(22,10)");
        svg.append("text")
            .text(function() { return f(self.legend.min);})
            .style("text-anchor", "start")
            .style("fill", "black")
            .attr("transform", "translate(22, " + (height) + ")");
	},

	createLegend2: function() {

		let self = this;
		let w, h, rec_width, translate_rects;

		if (self.type == "detail") {
			if ($("#" + self.container_id).width() > 1000){
				w = 180;
				h = 380;
				rec_width = 40;
				translate_rects = "translate(100,10)";
			} else {
				w = 60;
				h = 200;
				rec_width = 40;
				translate_rects = "translate(40,10)";
			}
		}

		if (self.type == "overview"){
			if ($("#" + self.container_id).width() > 220) {
				h = 180;
				w = 80;
				rec_width = 20;
				translate_rects = "translate(60,10)";
			} else {
				h = 120;
				w = 60;
				rec_width = 12;
				translate_rects = "translate(35,10)";
			}
		}

		d3.select("#" + self.legend_id).select("svg").remove();
		let svg = d3.select("#" + self.legend_id).append("svg")
			.attr("width", w)
			.attr("height", h);

		let legend = svg.append("defs")
	      .append("svg:linearGradient")
	      .attr("id", "gradient")
	      .attr("x1", "0%")
	      .attr("y1", "100%")
	      .attr("x2", "0%")
	      .attr("y2", "0%")
	      .attr("spreadMethod", "pad");

	    let pct = self.linspace(0, 100, self.scales['puOr11'].length).map((d) => {
			return Math.round(d) + '%';
	    });

	    var colourPct = d3.zip(pct, self.scales['puOr11']);
	    colourPct.forEach(function(d) {
            legend.append('stop')
                .attr('offset', d[0])
                .attr('stop-color', d[1])
                .attr('stop-opacity', 1);
        });

	    svg.append("rect")
	      .attr("width", rec_width)
	      .attr("height", h - 20)
	      .style("fill", "url(#gradient)")
	      .attr("transform", translate_rects);

	    let y = d3.scaleLinear().range([h - 20, 0]);
	    y.domain([self.legend.min, self.legend.max]).nice();
	    		
	    var legendAxis = d3.axisLeft(y)
            .tickFormat(d3.format(".2s"));

        svg.append("g")
            .attr("class", "legend axis legend-axis")
            .attr("transform", translate_rects)
            .call(legendAxis);

        if (self.type == "detail")
        	svg.selectAll("text").classed("legend-text", true);
        else 
        	svg.selectAll("text").classed("legend-text-overview", true);
	},

	linspace: function(start, end, n){
		//https://bl.ocks.org/starcalibre/6cccfa843ed254aa0a0d
        var out = [];
        var delta = (end - start) / (n - 1);

        var i = 0;
        while(i < (n - 1)) {
            out.push(start + (i * delta));
            i++;
        }

        out.push(end);
        return out;
	},

	createScale: function(){
		let self = this;
		/*
		self.scale = d3.scaleLinear()
		    .domain([self.legend.min, self.legend.avg, self.legend.max])
            .range([self.brewer.min, self.brewer.avg, self.brewer.max])
            .interpolate(d3.interpolateLab);
		*/
        self.scale = d3.scaleLinear()
		    .domain(self.linspace(self.legend.min, self.legend.max, self.scales['puOr11'].length))
            .range(self.scales['puOr11']);
	},

	createMiniMapPanel: function(communityData){
		let self = this;
		self.miniMapPanel = L.control({position: 'topleft'});
		self.miniMapPanel.onAdd = function(leafletMap){
            this._div = L.DomUtil.create('div', 'mini-map-container');
            return this._div;
        };

        self.miniMapPanel.update = function(communityData){
        	if (!self.minimap)
        		self.minimap = new EnergyMap("mini-map-container", self.controller, "overview", self.default_selection);
        	self.minimap.filters.detail = "community_areas";
        	self.minimap.data.community_areas = communityData;
        	self.minimap.parent = self;
			self.minimap.init();
			self.minimap.display();
        };

        self.miniMapPanel.addTo(self.map);
        $(".mini-map-container").attr('id', "mini-map-container");
	},


	/* Would not work for tracts or blocks because they have repetitive names*/
	getLayerByName: function(name){
		let self = this,
			layers = self.map._layers;
		for (let key in layers)
			if (layers[key].feature && (layers[key].feature.properties.community == name || layers[key].feature.properties.name10 == name))
				return layers[key];
		return null;
	},

	getLayerByGeoId: function(geoid){
		let self = this,
			layers = self.map._layers;
		for (let key in layers)
			if (layers[key].feature && layers[key].feature.properties.geoid10 == geoid)
				return layers[key];
		return null;
	},

	getLayerById: function(id){
		let self = this,
			layers = self.map._layers;
		for (let key in layers)
			if (layers[key].feature && layers[key].feature.properties.area_numbe == id)
				return layers[key];
		return null;
	}
};