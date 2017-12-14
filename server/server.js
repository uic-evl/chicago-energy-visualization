require('./config/config');

const express = require('express');
const path = require('path');

var {mongoose} = require('./db/mongoose');
var {GeoArea}  = require('./models/geoarea');
var {GeoTract} = require('./models/geotract');
var {GeoBlock} = require('./models/geoblock');
var {CommunityArea} = require('./models/community_area');
var {Utils} = require('./models/utils');
var {CommunityBuildings} = require('./models/community_buildings_type');
var {TractArea} = require('./models/tracts_area');
var {BlockArea} = require('./models/blocks_area');

var app = express();
const port = process.env.PORT;

app.use(express.static(__dirname + '/../public'));
app.use("/css", express.static(__dirname + '/../public/css'));
app.use("/js", express.static(__dirname + '/../public/js'));

// app.get('/bigmap', (req, res) => {
// 	res.sendFile(path.join(__dirname + './../html/bigmap.html'));
// });

app.get('/geoareas', (req, res) => {
	GeoArea.find().then((areas) => {
		var response = {
			data: areas,
			gas: {
				min: 0,
				max: 0,
				avg: 0
			},
			electricity: {
				min: 0,
				max: 0,
				avg: 0
			}
		};

		areas.forEach((area) => {
			console.log(area.properties.area_num_1);
			CommunityBuildings.findOne({'ID': area.properties.area_num_1}).then((buildings) => {
				if (!buildings) console.log(area.properties.area_num_1);
				else
					area.properties['buildings'] = buildings;
			});
		});

		Utils.find().then((utils) => {
			if (utils && utils.length > 0){
				response.gas.max = utils[0].community_areas.gas.max;
				response.gas.min = utils[0].community_areas.gas.min;
				response.gas.avg = utils[0].community_areas.gas.avg;
				response.electricity.max = utils[0].community_areas.electricity.max;
				response.electricity.min = utils[0].community_areas.electricity.min;
				response.electricity.avg = utils[0].community_areas.electricity.avg;
			}

			res.send(response);			
		}, (e) => {
			res.status(404).send(e);
		});
	}, (e) => {
		res.status(404).send(e);
	})
});

app.get('/geoareas/:community', (req, res) => {
	var community = req.params.community.toUpperCase();

	GeoArea.findOne({ 'properties.community': community }).then((geoarea) => {
		if (!geoarea)
			return res.status(404).send();

		CommunityBuildings.findOne({'ID': geoarea.properties.area_num_1}).then((buildings) => {
			geoarea.properties['buildings'] = buildings;
			res.send({geoarea});
		});

	}, (e) => {
		res.status(404).send(e);
	})
});

app.get('/geotracts/', (req, res) => {
	GeoTract.find().then((areas) => {
		var response = {
			data: areas,
			gas: {
				min: 0,
				max: 0,
				avg: 0
			},
			electricity: {
				min: 0,
				max: 0,
				avg: 0
			}
		};

		Utils.find().then((utils) => {
			if (utils && utils.length > 0){
				response.gas.max = utils[0].tracts.gas.max;
				response.gas.min = utils[0].tracts.gas.min;
				response.gas.avg = utils[0].tracts.gas.avg;
				response.electricity.max = utils[0].tracts.electricity.max;
				response.electricity.min = utils[0].tracts.electricity.min;
				response.electricity.avg = utils[0].tracts.electricity.avg;
			}
			res.send(response);			
		}, (e) => {
			res.status(404).send(e);
		});
	});
});

app.get('/geotracts/:community_number', (req, res) => {
	var community_number = req.params.community_number.toString();

	GeoTract.find({ 'properties.commarea': community_number }).then((geotracts) => {
		if (!geotracts)
			return res.status(404).send();

		var response = {
			data: geotracts,
			gas: {
				min: Number.MAX_VALUE,
				max: 0,
				avg: 0
			},
			electricity: {
				min: Number.MAX_VALUE,
				max: 0,
				avg: 0
			}
		};

		let sum_electricity = 0,
			sum_gas = 0,
			count_electricity = 0,
			count_gas = 0,
			count_no_electricity = 0,
			count_no_gas = 0;

		geotracts.forEach((geo_tract) => {
			if (geo_tract.properties.TOTAL_KWH == -1)
				count_no_electricity++; 
			else {
				count_electricity++;
				sum_electricity += geo_tract.properties.TOTAL_KWH;
				if (geo_tract.properties.TOTAL_KWH > response.electricity.max)
					response.electricity.max = geo_tract.properties.TOTAL_KWH;
				else if (geo_tract.properties.TOTAL_KWH < response.electricity.min)
					response.electricity.min = geo_tract.properties.TOTAL_KWH;
			}

			if (geo_tract.properties.TOTAL_THERMS == -1)
				count_no_gas++; 
			else {
				count_gas++;
				sum_gas += geo_tract.properties.TOTAL_THERMS;
				if (geo_tract.properties.TOTAL_THERMS > response.gas.max)
					response.gas.max = geo_tract.properties.TOTAL_THERMS;
				else if (geo_tract.properties.TOTAL_THERMS < response.gas.min)
					response.gas.min = geo_tract.properties.TOTAL_THERMS;
			}
		});

		response.electricity.avg = sum_electricity / count_electricity;
		response.gas.avg = sum_gas / count_gas;

		res.send(response);
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/geoblocks/:tract_number', (req, res) => {
	var tract_number = req.params.tract_number.toString();

	GeoBlock.find({ 'properties.tractce10': tract_number }).then((geoblocks) => {
		if (!geoblocks)
			return res.status(404).send();

		var response = {
			data: geoblocks,
			gas: {
				min: Number.MAX_VALUE,
				max: 0,
				avg: 0
			},
			electricity: {
				min: Number.MAX_VALUE,
				max: 0,
				avg: 0
			}
		};

		let sum_electricity = 0,
			sum_gas = 0,
			count_electricity = 0,
			count_gas = 0,
			count_no_electricity = 0,
			count_no_gas = 0;

		geoblocks.forEach((geo_block) => {
			if (geo_block.properties.TOTAL_KWH == -1)
				count_no_electricity++; 
			else {
				count_electricity++;
				sum_electricity += geo_block.properties.TOTAL_KWH;
				if (geo_block.properties.TOTAL_KWH > response.electricity.max)
					response.electricity.max = geo_block.properties.TOTAL_KWH;
				else if (geo_block.properties.TOTAL_KWH < response.electricity.min)
					response.electricity.min = geo_block.properties.TOTAL_KWH;
			}

			if (geo_block.properties.TOTAL_THERMS == -1)
				count_no_gas++; 
			else {
				count_gas++;
				sum_gas += geo_block.properties.TOTAL_THERMS;
				if (geo_block.properties.TOTAL_THERMS > response.gas.max)
					response.gas.max = geo_block.properties.TOTAL_THERMS;
				else if (geo_block.properties.TOTAL_THERMS < response.gas.min)
					response.gas.min = geo_block.properties.TOTAL_THERMS;
			}
		});

		response.electricity.avg = sum_electricity / count_electricity;
		response.gas.avg = sum_gas / count_gas;

		res.send(response);
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/geoblocksByCommunity/:community_id', (req, res) => {
	var community_id = req.params.community_id.toString();

	GeoBlock.find({ 'properties.COMMUNITY_AREA_ID': community_id }).then((geoblocks) => {
		if (!geoblocks)
			return res.status(404).send();

		var response = {
			data: geoblocks,
			gas: {
				min: Number.MAX_VALUE,
				max: 0,
				avg: 0
			},
			electricity: {
				min: Number.MAX_VALUE,
				max: 0,
				avg: 0
			}
		};

		let sum_electricity = 0,
			sum_gas = 0,
			count_electricity = 0,
			count_gas = 0,
			count_no_electricity = 0,
			count_no_gas = 0;

		geoblocks.forEach((geo_block) => {
			if (geo_block.properties.ANONYMOUS == true){
				count_no_electricity++; 
				count_no_gas++;
			}
			else {
				count_electricity++;
				sum_electricity += geo_block.properties.TOTAL_KWH;
				if (geo_block.properties.TOTAL_KWH > response.electricity.max)
					response.electricity.max = geo_block.properties.TOTAL_KWH;
				else if (geo_block.properties.TOTAL_KWH < response.electricity.min)
					response.electricity.min = geo_block.properties.TOTAL_KWH;

				count_gas++;
				sum_gas += geo_block.properties.TOTAL_THERMS;
				if (geo_block.properties.TOTAL_THERMS > response.gas.max)
					response.gas.max = geo_block.properties.TOTAL_THERMS;
				else if (geo_block.properties.TOTAL_THERMS < response.gas.min)
					response.gas.min = geo_block.properties.TOTAL_THERMS;
			}
		});

		response.electricity.avg = sum_electricity / count_electricity;
		response.gas.avg = sum_gas / count_gas;

		res.send(response);
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/utils', (req, res) => {
	var response = {
		gas: {
			min: 0,
			max: 0,
			avg: 0
		},
		electricity: {
			min: 0,
			max: 0,
			avg: 0
		}
	};

	Utils.find().then((utils) => {
		if (utils && utils.length > 0){
			response.gas.max = utils[0].community_areas.gas.max;
			response.gas.min = utils[0].community_areas.gas.min;
			response.gas.avg = utils[0].community_areas.gas.avg;
			response.electricity.max = utils[0].community_areas.electricity.max;
			response.electricity.min = utils[0].community_areas.electricity.min;
			response.electricity.avg = utils[0].community_areas.electricity.avg;
		}
		res.send(response);			
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/community_consumption/:community_id', (req, res) =>{
	let response = {},
		community_id = req.params.community_id.toString();

	CommunityArea.findOne({'COMMUNITY_AREA_NUMBER': community_id}).then((community) => {
		if (!community)
			return res.status(404).send();

		response.NAME = community.COMMUNITY_AREA_NAME;
		response.TOTAL_POPULATION = community.TOTAL_POPULATION;
		response.TOTAL_UNITS = community.TOTAL_UNITS;
		response.OCCUPIED_UNITS = community.OCCUPIED_UNITS;
		response.KWH_TOTAL_SQFT = community.KWH_TOTAL_SQFT;
		response.THERMS_TOTAL_SQFT = community.THERMS_TOTAL_SQFT;
		response.TOTAL_KWH = community.TOTAL_KWH;
		response.TOTAL_THERMS = community.TOTAL_THERMS;
		response.electricity = [  community.KWH_JANUARY_2010,
								  community.KWH_FEBRUARY_2010,
								  community.KWH_MARCH_2010,
								  community.KWH_APRIL_2010,
								  community.KWH_MAY_2010,
								  community.KWH_JUNE_2010,
								  community.KWH_JULY_2010,
								  community.KWH_AUGUST_2010,
								  community.KWH_SEPTEMBER_2010,
								  community.KWH_OCTOBER_2010,
								  community.KWH_NOVEMBER_2010,
								  community.KWH_DECEMBER_2010 ];

		response.gas = [  community.THERM_JANUARY_2010,
						  community.THERM_FEBRUARY_2010,
						  community.THERM_MARCH_2010,
						  community.THERM_APRIL_2010,
						  community.THERM_MAY_2010,
						  community.THERM_JUNE_2010,
						  community.THERM_JULY_2010,
						  community.THERM_AUGUST_2010,
						  community.THERM_SEPTEMBER_2010,
						  community.THERM_OCTOBER_2010,
						  community.THERM_NOVEMBER_2010,
						  community.THERM_DECEMBER_2010 ];
		res.send(response);
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/block_consumption/:census_block_id', (req, res) =>{
	let response = {},
		censusblock_id = req.params.census_block_id.toString();

	BlockArea.findOne({'CENSUS_BLOCK': censusblock_id}).then((block) => {
		if (!block)
			return res.status(404).send();

		response.NAME = block.COMMUNITY_AREA_NAME;
		response.ID = censusblock_id;
		response.TOTAL_POPULATION = block.TOTAL.TOTAL_POPULATION;
		response.TOTAL_UNITS = block.TOTAL.TOTAL_UNITS;
		response.OCCUPIED_UNITS = block.TOTAL.OCCUPIED_UNITS;
		response.KWH_TOTAL_SQFT = block.TOTAL.KWH_TOTAL_SQFT;
		response.THERMS_TOTAL_SQFT = block.TOTAL.THERMS_TOTAL_SQFT;
		response.TOTAL_KWH = block.TOTAL.TOTAL_KWH;
		response.TOTAL_THERMS = block.TOTAL.TOTAL_THERMS;
		response.electricity = [  block.TOTAL.KWH_JANUARY_2010,
								  block.TOTAL.KWH_FEBRUARY_2010,
								  block.TOTAL.KWH_MARCH_2010,
								  block.TOTAL.KWH_APRIL_2010,
								  block.TOTAL.KWH_MAY_2010,
								  block.TOTAL.KWH_JUNE_2010,
								  block.TOTAL.KWH_JULY_2010,
								  block.TOTAL.KWH_AUGUST_2010,
								  block.TOTAL.KWH_SEPTEMBER_2010,
								  block.TOTAL.KWH_OCTOBER_2010,
								  block.TOTAL.KWH_NOVEMBER_2010,
								  block.TOTAL.KWH_DECEMBER_2010 ];

		response.gas = [  block.TOTAL.THERM_JANUARY_2010,
						  block.TOTAL.THERM_FEBRUARY_2010,
						  block.TOTAL.THERM_MARCH_2010,
						  block.TOTAL.THERM_APRIL_2010,
						  block.TOTAL.THERM_MAY_2010,
						  block.TOTAL.THERM_JUNE_2010,
						  block.TOTAL.THERM_JULY_2010,
						  block.TOTAL.THERM_AUGUST_2010,
						  block.TOTAL.THERM_SEPTEMBER_2010,
						  block.TOTAL.THERM_OCTOBER_2010,
						  block.TOTAL.THERM_NOVEMBER_2010,
						  block.TOTAL.THERM_DECEMBER_2010 ];
		res.send(response);
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/tract_consumption/:tract_id', (req, res) =>{
	let response = {},
		tract_id = req.params.tract_id.toString();

	console.log(tract_id);
	TractArea.findOne({'TRACT': tract_id}).then((area) => {
		if (!area)
			return res.status(404).send();

		response.NAME = area.TRACT;
		response.ID = tract_id;
		response.TOTAL_POPULATION = area.TOTAL_POPULATION;
		response.TOTAL_UNITS = area.TOTAL_UNITS;
		response.OCCUPIED_UNITS = area.OCCUPIED_UNITS;
		response.KWH_TOTAL_SQFT = area.KWH_TOTAL_SQFT;
		response.THERMS_TOTAL_SQFT = area.THERMS_TOTAL_SQFT;
		response.TOTAL_KWH = area.TOTAL_KWH;
		response.TOTAL_THERMS = area.TOTAL_THERMS;
		response.electricity = [  area.KWH_JANUARY_2010,
								  area.KWH_FEBRUARY_2010,
								  area.KWH_MARCH_2010,
								  area.KWH_APRIL_2010,
								  area.KWH_MAY_2010,
								  area.KWH_JUNE_2010,
								  area.KWH_JULY_2010,
								  area.KWH_AUGUST_2010,
								  area.KWH_SEPTEMBER_2010,
								  area.KWH_OCTOBER_2010,
								  area.KWH_NOVEMBER_2010,
								  area.KWH_DECEMBER_2010 ];

		response.gas = [  area.THERM_JANUARY_2010,
						  area.THERM_FEBRUARY_2010,
						  area.THERM_MARCH_2010,
						  area.THERM_APRIL_2010,
						  area.THERM_MAY_2010,
						  area.THERM_JUNE_2010,
						  area.THERM_JULY_2010,
						  area.THERM_AUGUST_2010,
						  area.THERM_SEPTEMBER_2010,
						  area.THERM_OCTOBER_2010,
						  area.THERM_NOVEMBER_2010,
						  area.THERM_DECEMBER_2010 ];
		res.send(response);
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/buildings/:id', (req, res) => {
	var id = parseInt(req.params.id);

	CommunityBuildings.findOne({ 'ID': id }).then((building) => {
		if (!building)
			return res.status(404).send();

		res.send({building});
	}, (e) => {
		res.status(404).send(e);
	})
});


app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};