const async = require('async');
var csv = require("fast-csv");

const {MongoClient, ObjectID} = require ('mongodb');
const { community_area_numbers } = require('./community_area_numbers');
const { Big } = require('big.js');

MongoClient.connect('mongodb://localhost:27017/chicago_energy_2010', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server.');
	}
	console.log('Connected to MongoDB Energy server');
	updateCommunities(db);
});

function updateCommunities(db){
	var inputFile='energy_communities.csv';

	var csvData=[];
	csv
	 .fromPath(inputFile)
	 .on("data", function(row){ csvData.push(row); })
	 .on("end", function(){
	    csvData = csvData.slice(1);	// remove header

	    db.collection('geo_areas').find({}).toArray().then((geo_areas) => {
			geo_areas.forEach((geo_area) => {
				var community_number = parseInt(geo_area.properties.area_num_1);
				//geo_area = getEnergyProperties(community_number, csvData, geo_area);
				for (let i = 0; i < csvData.length; i++) {
					if (csvData[i][0] == community_number) {
						geo_area.properties.AREA_ELECTRICITY = parseFloat(csvData[i][4]);
						geo_area.properties.AREA_GAS = parseFloat(csvData[i][5]);
					}
				}
				db.collection('geo_areas').save(geo_area);

			});

			console.log("end processing");
		}, (e) => {
			console.log("Error obtaining the geocommunities", e);
		});
	 });
}

function updateCommunities2(db){
	var inputFile='energy_communities.csv';

	var csvData=[];
	csv
	 .fromPath(inputFile)
	 .on("data", function(row){ csvData.push(row); })
	 .on("end", function(){
	    csvData = csvData.slice(1);	// remove header

	    db.collection('community_areas_2').find({}).toArray().then((areas) => {
			areas.forEach((area) => {
				var community_number = parseInt(area.COMMUNITY_AREA_NUMBER);
				//area = getCommunityProperties(community_number, csvData, area);
				db.collection('community_areas_2').save(area);

			});

			console.log("end processing");
		}, (e) => {
			console.log("Error obtaining the geocommunities", e);
		});
	 });
}

function getEnergyProperties(id, props, area) {

	for (let i = 0; i < props.length; i++) {
		if (props[i][0] == id) {

			area.properties.TOTAL_KWH = parseFloat(props[i][2]);
			area.properties.TOTAL_THERMS = parseFloat(props[i][3]);
			area.properties.KWH_TOTAL_SQFT = parseFloat(props[i][6]);
			area.properties.THERMS_TOTAL_SQFT = parseFloat(props[i][7]);
			area.properties.KWH_TOTAL_SQMETERS = parseFloat(props[i][8]);
			area.properties.THERMS_TOTAL_SQMETERS = parseFloat(props[i][9]);

			if (isNaN(area.properties.TOTAL_KWH)){
				area.properties.KWH_TOTAL_CAPITA = -1;
			} else if (area.properties.POPULATION == 0){
				area.properties.KWH_TOTAL_CAPITA = 0;
			} else {
				area.properties.KWH_TOTAL_CAPITA = area.properties.TOTAL_KWH / area.properties.POPULATION;
			}

			if (isNaN(area.properties.TOTAL_THERMS)){
				area.properties.THERMS_TOTAL_CAPITA = -1;
			} else if (area.properties.POPULATION == 0){
				area.properties.THERMS_TOTAL_CAPITA = 0;
			} else {
				area.properties.THERMS_TOTAL_CAPITA = area.properties.TOTAL_THERMS / area.properties.POPULATION;
			}

			return area;
		}
	}
	console.log("not found: " + id);
	return area;

}

function getCommunityProperties(id, props, area) {

	for (let i = 0; i < props.length; i++) {
		if (props[i][0] == id) {

			area.TOTAL_KWH = parseFloat(props[i][2]);
			area.TOTAL_THERMS = parseFloat(props[i][3]);
			area.KWH_TOTAL_SQFT = parseFloat(props[i][6]);
			area.THERMS_TOTAL_SQFT = parseFloat(props[i][7]);
			area.KWH_TOTAL_SQMETERS = parseFloat(props[i][8]);
			area.THERMS_TOTAL_SQMETERS = parseFloat(props[i][9]);

			if (isNaN(area.TOTAL_KWH)){
				area.KWH_TOTAL_CAPITA = -1;
			} else if (area.TOTAL_POPULATION == 0){
				area.KWH_TOTAL_CAPITA = 0;
			} else {
				area.KWH_TOTAL_CAPITA = area.TOTAL_KWH / area.TOTAL_POPULATION;
			}

			if (isNaN(area.TOTAL_THERMS)){
				area.THERMS_TOTAL_CAPITA = -1;
			} else if (area.TOTAL_POPULATION == 0){
				area.THERMS_TOTAL_CAPITA = 0;
			} else {
				area.THERMS_TOTAL_CAPITA = area.TOTAL_THERMS / area.TOTAL_POPULATION;
			}

			return area;
		}
	}
	console.log("not found: " + id);
	return area;

}

function updateCensusTracts(db) {
	var inputFile='energy_tracts.csv';

	var csvData=[];
	csv
	 .fromPath(inputFile)
	 .on("data", function(row){ csvData.push(row); })
	 .on("end", function(){
	    csvData = csvData.slice(1);	// remove header

	    db.collection('geo_tracts').find({}).toArray().then((geo_tracts) => {
			geo_tracts.forEach((geo_tract) => {
				var number = "Census Tract " + geo_tract.properties.tractce10;
				//geo_tract = getTractProperties(number, csvData, geo_tract);
				for (let i = 0; i < csvData.length; i++) {
					if (csvData[i][0] == number) {
						geo_tract.properties.AREA_ELECTRICITY = parseFloat(csvData[i][3]);
						geo_tract.properties.AREA_GAS = parseFloat(csvData[i][4]);
					}
				}
				db.collection('geo_tracts').save(geo_tract);

			});

			console.log("end processing");
		}, (e) => {
			console.log("Error obtaining the geo tracts", e);
		});
	 });

}


function getTractProperties(id, props, area) {

	for (let i = 0; i < props.length; i++) {
		if (props[i][0] == id) {

			area.properties.TOTAL_KWH = parseFloat(props[i][1]);
			area.properties.TOTAL_THERMS = parseFloat(props[i][2]);
			area.properties.KWH_TOTAL_SQFT = parseFloat(props[i][5]);
			area.properties.THERMS_TOTAL_SQFT = parseFloat(props[i][6]);
			area.properties.KWH_TOTAL_SQMETERS = parseFloat(props[i][7]);
			area.properties.THERMS_TOTAL_SQMETERS = parseFloat(props[i][8]);

			if (isNaN(area.properties.TOTAL_KWH)){
				area.properties.KWH_TOTAL_CAPITA = -1;
			} else if (area.properties.POPULATION == 0){
				area.properties.KWH_TOTAL_CAPITA = 0;
			} else {
				area.properties.KWH_TOTAL_CAPITA = area.properties.TOTAL_KWH / area.properties.POPULATION;
			}

			if (isNaN(area.properties.TOTAL_THERMS)){
				area.properties.THERMS_TOTAL_CAPITA = -1;
			} else if (area.properties.POPULATION == 0){
				area.properties.THERMS_TOTAL_CAPITA = 0;
			} else {
				area.properties.THERMS_TOTAL_CAPITA = area.properties.TOTAL_THERMS / area.properties.POPULATION;
			}

			return area;
		}
	}
	console.log("not found: " + id);

	area.properties.TOTAL_KWH = -1;
	area.properties.TOTAL_THERMS = -1;
	area.properties.KWH_TOTAL_SQFT = -1;
	area.properties.THERMS_TOTAL_SQFT = -1;
	area.properties.KWH_TOTAL_SQMETERS = -1;
	area.properties.THERMS_TOTAL_SQMETERS = -1;
	area.properties.KWH_TOTAL_CAPITA = -1;
	area.properties.THERMS_TOTAL_CAPITA = -1;
	return area;

}

function updateCensusBlocks(db) {
	var inputFile='energy_blocks.csv';

	var csvData=[];
	csv
	 .fromPath(inputFile)
	 .on("data", function(row){ csvData.push(row); })
	 .on("end", function(){
	    csvData = csvData.slice(1);	// remove header

	    db.collection('geo_blocks_4').find({}).toArray().then((geo_blocks) => {
			geo_blocks.forEach((geo_block) => {
				var geoid = geo_block.properties.geoid10;
				//geo_block = getBlockProperties(geoid, csvData, geo_block);
				for (let i = 0; i < csvData.length; i++) {
					if (csvData[i][0] == geoid) {
						geo_block.properties.AREA_ELECTRICITY = parseFloat(csvData[i][3]);
						geo_block.properties.AREA_GAS = parseFloat(csvData[i][4]);
					}
				}
				db.collection('geo_blocks_4').save(geo_block);

			});

			console.log("end processing");
		}, (e) => {
			console.log("Error obtaining the geo tracts", e);
		});
	 });

}


function getBlockProperties(id, props, area) {

	for (let i = 0; i < props.length; i++) {
		if (props[i][0] == id) {

			area.properties.TOTAL_KWH = parseFloat(props[i][1]);
			if (isNaN(area.properties.TOTAL_KWH)) area.properties.TOTAL_KWH = -1.0;

			area.properties.TOTAL_THERMS = parseFloat(props[i][2]);
			if (isNaN(area.properties.TOTAL_KWH)) area.properties.TOTAL_THERMS = -1.0;

			area.properties.KWH_TOTAL_SQFT = parseFloat(props[i][5]);
			if (isNaN(area.properties.TOTAL_KWH)) area.properties.KWH_TOTAL_SQFT = -1.0;

			area.properties.THERMS_TOTAL_SQFT = parseFloat(props[i][6]);
			if (isNaN(area.properties.TOTAL_KWH)) area.properties.THERMS_TOTAL_SQFT = -1.0;

			area.properties.KWH_TOTAL_SQMETERS = parseFloat(props[i][7]);
			if (isNaN(area.properties.TOTAL_KWH)) area.properties.KWH_TOTAL_SQMETERS = -1.0;

			area.properties.THERMS_TOTAL_SQMETERS = parseFloat(props[i][8]);
			if (isNaN(area.properties.TOTAL_KWH)) area.properties.THERMS_TOTAL_SQMETERS = -1.0;

			if (isNaN(area.properties.TOTAL_KWH)){
				area.properties.KWH_TOTAL_CAPITA = -1;
			} else if (area.properties.POPULATION == 0){
				area.properties.KWH_TOTAL_CAPITA = 0;
			} else {
				area.properties.KWH_TOTAL_CAPITA = area.properties.TOTAL_KWH / area.properties.POPULATION;
			}

			if (isNaN(area.properties.TOTAL_THERMS)){
				area.properties.THERMS_TOTAL_CAPITA = -1;
			} else if (area.properties.POPULATION == 0){
				area.properties.THERMS_TOTAL_CAPITA = 0;
			} else {
				area.properties.THERMS_TOTAL_CAPITA = area.properties.TOTAL_THERMS / area.properties.POPULATION;
			}

			return area;
		}
	}
	console.log("not found: " + id);

	area.properties.TOTAL_KWH = -1.0;
	area.properties.TOTAL_THERMS = -1.0;
	area.properties.KWH_TOTAL_SQFT = -1.0;
	area.properties.THERMS_TOTAL_SQFT = -1.0;
	area.properties.KWH_TOTAL_SQMETERS = -1.0;
	area.properties.THERMS_TOTAL_SQMETERS = -1.0;
	area.properties.KWH_TOTAL_CAPITA = -1;
	area.properties.THERMS_TOTAL_CAPITA = -1;

	return area;

}
