"use strict";

var App = App || {};

	/* Map definition */
	const EnergyMap2	= function(container_id){
		var self = {};

		var container_id = container_id,
				margin = { top: 20, right: 20, bottom: 20, left: 20 },
				height = 0,
				width = 0;

		var map = null,	// Leaflet map
				center = {'lat': 41.8500300, 'lng': -87.6500500},
				zoomLevel = 11;

		var svg = null,
				svg_g = null;

		function initialize(container_id){
			console.log(container_id);

			return create_leaflet_map(container_id);
		}

		function create_leaflet_map(container_id){
			map = new L.map(container_id);
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

	    map.setView([center.lat, center.lng], zoomLevel);
	    map.addLayer(osm);
	    map.zoomControl.setPosition("bottomleft");

		  return 0;		
		}

		return {
			init: initialize
		}
	};

	function test(){
		this.a = 1;
	}	

	App.EnergyMapFactory = {
		create: function(){
			return new EnergyMap();
			// return _.assign({}, new test, new EnergyMap);
		}
	};