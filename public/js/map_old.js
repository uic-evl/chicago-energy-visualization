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
	this.minimap = null;
	this.center = {'lat': 41.8500300, 'lng': -87.60};
	this.zoomLevel = 11;
	this.selectedLayer = null;
	this.preHighlightColor = null;
	this.selectedColor = null;

	this.svg = null;
	this.svg_g = null;
	this.geoJsonLayer = null;
	this.scale = null;

	this.filters = {
		data2display: "electricity",
		detail: "community_areas",
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
};

EnergyMap.prototype = {
	constructor: EnergyMap,

	init: function(communityData){

			var self = this;
			self.createLeafletMap();
			self.createButtonsPanel();

			if (self.type == "overview"){
				self.data.community_areas = communityData;
				self.createMiniMapPanel();
				self.display();
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
	      	
	        if (self.type == "detail") osmAttrib = "";
	      	let osm = new L.TileLayer(osmUrl,
	          {   
	          	  attribution: osmAttrib,
	              minZoom: 11,
	              id:'mapbox.light',
	              accessToken: 'pk.eyJ1IjoianRyZWxsMiIsImEiOiJjaXZpamo1NngwMTlpMnpvNndjeWR0NzhmIn0.2-3ieO-fWXW0Zr0KGWz6XA'
	          });	

		    self.map.setView([self.center.lat, self.center.lng], self.zoomLevel);
		    self.map.addLayer(osm);
		    self.map.zoomControl.setPosition("bottomleft");
		}

	    return self;		
	},

	appendSVGtoMap: function(energy_map){
		var d3props = {};
		d3props.svg = d3.select(energy_map.getPanes().overlayPane).append("svg");
		d3props.g = svg.append("g").attr("class", "leaflet-zoom-hide");
		//self.map.on("click", function(e){ map.clickedLatLong = e.latlng; });

	    // Set the D3 projection properties
	    d3props.transform = d3.geoTransform({ point: projectPoint });
	    d3props.path = d3.geoPath().projection(d3props.transform);

	    function projectPoint(x, y){
	        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	        this.stream.point(point.x, point.y);
	    }

	    return d3props;
	},

	addData: function(url, type){
		let self = this;

		// return here, move done out
		return $.getJSON(url, { format: "jsonp" }).done((data) => {
			if (type == 'community_areas')
				self.data.community_area = data.data;
			else if (type == 'census_tracts')
				self.data.tracts = data.data;
			else if (type == 'census_blocks')
				self.data.census_block = data.data;
			self.setLegendValues(data);

			self.geoJsonLayer = L.geoJSON(data.data, {
				style: function(feature){ return self.setGeoJSONStyle(feature);},
				onEachFeature: function(feature, layer) { 
					self.onEachFeature(feature, layer);
				}
			}).addTo(self.map);
			self.createLegend();

			if (self.type == "detail"){
				let bounds = self.geoJsonLayer.getBounds();
				self.map.fitBounds(bounds);
			}

			if (self.default_selection) {
				self.selectLayer(self.getLayerByName(self.default_selection));
				self.default_selection = null;
			}	
		});
	}, 

	addData2: function(data){

		let self = this;
		self.setLegendValues(data);

		self.geoJsonLayer = L.geoJSON(data.data, {
				style: function(feature){ return self.setGeoJSONStyle(feature);},
				onEachFeature: function(feature, layer) { 
					self.onEachFeature(feature, layer);
				}
			}).addTo(self.map);
		self.createLegend();

		if (self.type == "detail"){
			let bounds = self.geoJsonLayer.getBounds();
			self.map.fitBounds(bounds);
		}

		if (self.default_selection) {
			self.selectLayer(self.getLayerByName(self.default_selection));
			self.default_selection = null;
		}	
	},

	onEachFeature: function(feature, layer){
		let self = this;

/*
		if (feature.properties) {
        	layer.bindPopup('<h1>'+feature.properties.community+'</h1><p>name: '+feature.properties.TOTAL_KWH+'</p>');
    	}*/
    	
		layer.on({
			click: function(e){self.whenClicked(e);}, 
			mouseover: function(e){self.highlightFeature(e);},
			mouseout: function(e){self.resetHighlight(e);}
		});
	},

	whenClicked: function(e){
		let layer = e.target;
		this.selectLayer(layer);
	},

	selectLayer: function(layer){
		let self = this;
		let id = layer.feature.properties.area_numbe;

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

		self.controller.onMapClicked(id, self.filters.detail);
		self.miniMapPanel.update(id, "census_tracts");
	},

	highlightFeature: function(e){
		let self = this,
			layer = e.target;

		if (layer != self.selectedLayer){
			self.preHighlightColor = layer.options.color;
			layer.setStyle({
				weight: 2,
				color: 'black',
				dashArray: '5,5',
				fillOpacity: 0
			});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge)
	        	layer.bringToFront();
		}
	},

	resetHighlight: function(e) {
		let self = this;
		if (self.selectedLayer != e.target)
			self.geoJsonLayer.resetStyle(e.target);

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
		if (self.filters.scale == 'real'){
			self.legend.min = data[self.filters.data2display].min;
			self.legend.max = data[self.filters.data2display].max;
			self.legend.avg = data[self.filters.data2display].avg;
		} else {
			self.legend.min = Math.log(data[self.filters.data2display].min);
			self.legend.max = Math.log(data[self.filters.data2display].max);
			self.legend.avg = Math.log(data[self.filters.data2display].avg);	
		};
		self.createScale();
	},

	setGeoJSONStyle: function(feature){
		let self = this,
			field = 'TOTAL_KWH';
		if (self.filters.data2display == 'gas') field = 'TOTAL_THERMS';

		let value = feature.properties[field];
		if (self.filters.scale == "logarithmic")
			value = Math.log(value);

		let color = self.scale(value);
		return { color: color, fillOpacity: 0.6 };
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

	loadCensusBlock: function(tract_id) {
		
		if (this.geoJsonLayer != null) this.clear();
		this.controller.getCensusBlockGeoData(tract_id)
			.then((data) => { this.addData2(data); });

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
		self.map.buttons_panel = L.control({ position: 'topleft' });

		self.map.buttons_panel.onAdd = (leaflet_map) => {
			this._div = L.DomUtil.create('div', self.legend_id);
            //$(this._div).load("./view/ButtonsPanel.html", (data) => { ko.applyBindings(view_model);});
            return this._div;
		};
		
		self.map.buttons_panel.addTo(self.map);
		$("." + self.legend_id).attr("id", self.legend_id);
	},

	getPanelDataBinding: function(){
		let self = this;
		let view_model = {
			button_show_electricity: ko.observable("btn_overview_show_electricity"),
			rb_show_electricity: ko.observable("rb_overview_show_electricity"),
			button_show_gas : ko.observable("btn_overview_show_gas"),
			rb_show_gas: ko.observable("rb_overview_show_gas"),
			button_show_communities: ko.observable("btn_overview_show_communities"),
			rb_show_communities: ko.observable("rb_overview_show_communities"),
			button_show_tracts: ko.observable("btn_overview_show_tracts"),
			rb_show_tracts: ko.observable("rb_overview_show_tracts"),
			button_show_real: ko.observable("btn_overview_show_real"),
			rb_show_real: ko.observable("rb_overview_show_real"),
			button_show_log: ko.observable("btn_overview_show_log"),
			rb_show_log: ko.observable("rb_overview_show_log"),
			legend_text: ko.observable("Example legend text"),
			legend_container_id: ko.observable("overview_legend_container"),
			show_title: false
		};
		view_model.showElectricity = () => {self.showEnergy(self, "electricity", view_model);};
		view_model.showGas = () => {self.showEnergy(self, "gas", view_model);};
		view_model.showCommunityAreas = () => {self.showDetail(self, "community_areas", view_model);};
		view_model.showCensusTracts = () => {self.showDetail(self, "tracts", view_model);};
		view_model.showRealValues = () => {self.changeScale(self,"real",view_model);};
		view_model.showLogValues = () => {self.changeScale(self,"log",view_model);};

		return view_model;
	},

	showEnergy: function(o, energy, view_model){
		let btn2disable, btn2enable;
		if (energy == 'gas'){
			btn2disable = "#" + view_model.button_show_electricity();
			btn2enable = "#" + view_model.button_show_gas();
		}
		else{
			btn2disable = "#" + view_model.button_show_gas();
			btn2enable = "#" + view_model.button_show_electricity();
		}
		
		if (o.filters.data2display != energy){
			$(btn2disable).removeClass("active");
			$(btn2enable).addClass("active");
			o.filters.data2display = energy;
			o.display();
		}	
	},

	onFilterChange: function(filter, value){
		let self = this;
		if (self.filters[filter] != value){
			self.filters[filter] = value;
			self.display();
		}
	},

	onEnergyChange: function(energy){
		this.onFilterChange("data2display", energy);
	},

	onAreaLevelChange: function(area_level){
		if (area_level == "census tracts")
			area_level = "census_tracts";
		else if (area_level == "community areas")
			area_level = "community_areas";
		this.onFilterChange("detail", area_level);
	},

	onScaleChange: function(scale){
		this.onFilterChange("scale", scale);
	},

	showDetail: function(o, detail, view_model){
		let btn2disable, btn2enable;
		if (detail == 'community_areas'){
			btn2disable = "#" + view_model.button_show_tracts();
			btn2enable = "#" + view_model.button_show_communities();
		}
		else{
			btn2disable = "#" + view_model.button_show_communities();
			btn2enable = "#" + view_model.button_show_tracts();
		}

		if (o.filters.detail != detail){
			$(btn2disable).removeClass("active");
			$(btn2enable).addClass("active");
			o.filters.detail = detail;
			o.display();
		} 
	},

	changeScale: function(o, scale, view_model){
		let btn2disable, btn2enable;
		if (scale == 'real'){
			btn2disable = "#" + view_model.button_show_log();
			btn2enable = "#" + view_model.button_show_real();
		}
		else{
			btn2disable = "#" + view_model.button_show_real();
			btn2enable = "#" + view_model.button_show_log();
		}

		if (o.filters.scale != scale){
			$(btn2disable).removeClass("active");
			$(btn2enable).addClass("active");
			o.filters.scale = scale;
			o.display();
		}
	},

	display: function(id){
		var self = this;

		//return new Promise((resolve, reject) => {
			if (self.filters.detail == "community_areas")
				self.loadCommunityAreas();
			else if (self.filters.detail == "census_tracts")
				if (id) self.loadCensusTracts(id);
				else self.loadCensusTracts(); 
			else if (self.filters.detail == "census_blocks")
				self.loadCensusBlock(id);
		//});
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

        var f = d3.format(".2s");
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

	createScale: function(){
		let self = this;
		self.scale = d3.scaleLinear()
		    .domain([self.legend.min, self.legend.avg, self.legend.max])
            .range([self.brewer.min, self.brewer.avg, self.brewer.max])
            .interpolate(d3.interpolateLab);
	},

	createMiniMapPanel: function(){
		let self = this;
		self.miniMapPanel = L.control({position: 'topright'});
		self.miniMapPanel.onAdd = function(leafletMap){
            this._div = L.DomUtil.create('div', 'mini-map-container');
            return this._div;
        };

        self.miniMapPanel.update = function(id, detail_level){
        	if (!self.minimap)
        		self.minimap = new EnergyMap("mini-map-container", self.controller, "detail");
        	self.minimap.filters.detail = detail_level;
			self.minimap.init();
			self.minimap.display(id);
        };

        self.miniMapPanel.addTo(self.map);
        $(".mini-map-container").attr('id', "mini-map-container");
	},

	getDetailsDataBinding: function(feature){
		var f = d3.format(".2s");
		let self = this,
			view_model = {
				community: ko.observable(feature.community),
				electricity: ko.observable(f(feature.TOTAL_KWH) + "W"),
				gas: ko.observable(f(feature.TOTAL_THERMS) + "Thm")
			}
		return view_model;
	},

	getConsumption: function(type, id){
		let self = this,
			url = "";

		if (type == "community_areas")
			url = "localhost:3000/community_consumption/" + id;

		$.getJSON(url, { format: "jsonp" }).done((data) => {
			
		});
	},

	getLayerByName: function(name){
		let self = this,
			layers = self.map._layers;
		for (let key in layers)
			if (layers[key].feature && layers[key].feature.properties.community == name)
				return layers[key];
		console.log('null');
		return null;
	}
};