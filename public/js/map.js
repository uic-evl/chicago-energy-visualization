'use strict';

// Create globals so leaflet can load
function EnergyMap(container_id){

	this.container_id = container_id;
	this.legend_id = null;
	this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
	this.height = 0;
	this.width = 0;

	this.map = null;	// Leaflet map
	this.center = {'lat': 41.8500300, 'lng': -87.6500500};
	this.zoomLevel = 11;

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
		min: "#008837",
		avg: "#f7f7f7",
		max: "#7b3294"
	};
};

EnergyMap.prototype = {
	constructor: EnergyMap,

	init: function(){
		var self = this;
		self.createLeafletMap();
		self.createButtonsPanel();
		self.display(self.legend_container_id);
		//self.d3props = self.appendSVGtoMap(self.map);
	},

	createLeafletMap: function(){
		var self = this;

		self.map = new L.map(self.container_id);
		var osmUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
      	osmAttrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
          					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          					'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      	osm = new L.TileLayer(osmUrl,
          {   
          	  attribution: osmAttrib,
              minZoom: 11,
              id:'mapbox.dark',
              accessToken: 'pk.eyJ1IjoianRyZWxsMiIsImEiOiJjaXZpamo1NngwMTlpMnpvNndjeWR0NzhmIn0.2-3ieO-fWXW0Zr0KGWz6XA'
          });	

	    self.map.setView([self.center.lat, self.center.lng], self.zoomLevel);
	    self.map.addLayer(osm);
	    self.map.zoomControl.setPosition("bottomleft");

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
		var self = this;

		$.getJSON(url, { format: "jsonp" }).done((data) => {
			if (type == 'community_areas')
				self.data.community_area = data.data;
			else if (type == 'census_tracts')
				self.data.tracts = data.data;
			self.setLegendValues(data);

			self.geoJsonLayer = L.geoJSON(data.data, {
				style: function(feature){
					return self.setGeoJSONStyle(feature);
				}
			}).addTo(self.map);
			self.createLegend();
		});
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
		//console.log("min: " + self.legend.min + " - max: " + self.legend.max);
	},

	setGeoJSONStyle: function(feature){
		let self = this,
			field = 'TOTAL_KWH';
		if (self.filters.data2display == 'gas') field = 'TOTAL_THERMS';

		let value = feature.properties[field];
		if (self.filters.scale == "log")
			value = Math.log(value);
		//console.log(feature.properties.community + ": " + feature.properties.TOTAL_KWH);

		let color = self.scale(value);
		return { color: color };
	},

	loadCommunityAreas: function(){
		var self = this;
		if (self.geoJsonLayer != null) self.clear();
		self.addData('http://localhost:3000/geoareas', 'community_areas');
	},

	loadCensusTracts: function() {
		var self = this;
		if (self.geoJsonLayer != null) self.clear();
		self.addData('http://localhost:3000/geotracts', 'census_tracts');
	},

	clear: function(){
		this.geoJsonLayer.clearLayers();
	},

	createButtonsPanel: function() {
		let self = this;
		let view_model = self.getPanelDataBinding();

		self.map.buttons_panel = L.control({ position: 'topleft' });
		self.map.buttons_panel.onAdd = (leaflet_map) => {
			this._div = L.DomUtil.create('div', 'buttons_panel_' + self.container_id);
            $(this._div).load("./view/ButtonsPanel.html", (data) => { ko.applyBindings(view_model);});
            return this._div;
		};
		self.legend_id = "#" + view_model.legend_container_id();
		self.map.buttons_panel.addTo(self.map);
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
			show_title: true
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

	display: function(){
		var self = this;
		if (self.filters.detail == "community_areas")
			self.loadCommunityAreas();
		else if (self.filters.detail == "tracts")
			self.loadCensusTracts();
	},

	createLegend: function(){
		let self = this;

		let width = $(self.legend_id).parent().width() * 0.95,
			divisions = width,
			fake_data = [],
			rect_width = Math.floor(width/divisions); //the heck?

		let increment = self.legend.max / divisions;
		for (let i = self.legend.min; i < self.legend.max; i += increment)
			fake_data.push(i);

		d3.select(self.legend_id).select("svg").remove();
		let svg = d3.select(self.legend_id).append("svg")
			.attr("width", width)
			.attr("height", 40);	//TODO make this dynamic
		let legend = svg.append("g").attr("class", "YesLegend");
		legend.selectAll("rect")
                .data(fake_data)
                .enter()
                .append("rect")
                .attr("x", function (d, i) { return i * rect_width; })
                .attr("y", 10)
                .attr("height", 10)
                .attr("width", rect_width)
                .attr("fill", function (d) { return self.scale(d)}
    	);

        var f = d3.format(".2s");
        svg.append("text")
            .text(function() { return f((self.legend.min));})
            .style("text-anchor", "start")
            .style("fill", "white")
            .attr("transform", "translate(0,30)");
        svg.append("text")
            .text(function() { return f(self.legend.max);})
            .style("text-anchor", "end")
            .style("fill", "white")
            .attr("transform", "translate(" + (width) + ",30)");
	},

	createScale: function(){
		let self = this;
		self.scale = d3.scaleLinear()
		    .domain([self.legend.min, self.legend.avg, self.legend.max])
            .range([self.brewer.min, self.brewer.avg, self.brewer.max])
            .interpolate(d3.interpolateLab);
	}
};