require('./config/config');

const express = require('express');
const path = require('path');

var {mongoose} = require('./db/mongoose');
var {GeoArea}  = require('./models/geoarea');
var {GeoTract} = require('./models/geotract');
var {GeoBlock} = require('./models/geoblock');
var {CommunityArea} = require('./models/community_area');
var {Utils} = require('./models/utils');

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
		res.send({geoarea});
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
				console.log("tracts utils: " + utils[0]);
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
		res.send({geotracts});
	}, (e) => {
		res.status(404).send(e);
	});
});

app.get('/geoblocks/:tract_number', (req, res) => {
	var tract_number = req.params.tract_number.toString();

	GeoBlock.find({ 'properties.tractce10': tract_number }).then((geoblocks) => {
		if (!geoblocks)
			return res.status(404).send();
		res.send({geoblocks});
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


app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};