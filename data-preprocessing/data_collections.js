// mongoimport --type csv --db chicago_energy_2010 --collection blocks --file "D:\UIC Drive\2016 - Fall\Energy_Usage_2010.csv --headerline"
const async = require('async');

const {MongoClient, ObjectID} = require ('mongodb');
const { community_area_numbers } = require('./community_area_numbers');
const { Big } = require('big.js');

MongoClient.connect('mongodb://localhost:27017/chicago_energy_2010', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server.');
	}
	console.log('Connected to MongoDB Energy server');
	getMaxValues(db, "tracts");
	//addTest(db);
	//addCommunityAreaNumbers(db);
});

function preprocessData(db){
	createCommunityAreas(db);		// Get data as it is, 
	convertCensusCodeToString(db);
	splitCensusBlockCode(db);
	cleanAggregationFields(db);
	createCensusTracts(db);
};


//TODO: update all the data set, blank blocks are just aggregated data due to confidentiality.
function createCommunityAreas(db){
	//return new Promise(function(resolve, reject) 
	db.collection('blocks').find({CENSUS_BLOCK: ''}).toArray().then((community_areas) => {
		var no_community_areas = community_areas.length;
		console.log(`Extracting ${no_community_areas} community areas`);

		community_areas.forEach(function(community_area){
			db.collection('community_areas').save(community_area);
		});

		console.log(`Removing ${no_community_areas} entries from blocks`);
		db.collection('blocks').remove({CENSUS_BLOCK: ''});
		//resolve();
	}, (err) => {
		console.log("Error extracting community areas", err);
		//reject();
	});
}

function convertCensusCodeToString(db){
	db.collection('blocks').find({}).toArray().then((blocks) => {
		var no_blocks = blocks.length;
		console.log(`Updating census code type for ${no_blocks} blocks`);

		blocks.forEach(function(block){
			block.CENSUS_BLOCK = '' + block.CENSUS_BLOCK;
			db.collection('blocks').save(block);
		});

		console.log("Finished updating the CENSUS_BLOCK column type");
	}, (err) => {
		console.log("Error converting census code type from numeric to string", err);
	});
}

function splitCensusBlockCode(db, filter){
	if (filter == null){
		filter = {};
	}

	db.collection('blocks').find(filter).toArray().then((blocks) => {
		console.log(`Splitting the CENSUS_BLOCK code for ${blocks.length} records in the block collection`);

		blocks.forEach(function(block){
			if (block.CENSUS_BLOCK != ''){
				block.STATE_FIPS = block.CENSUS_BLOCK.substring(0,2);
				block.COUNTY_FIPS = block.CENSUS_BLOCK.substring(2,5);
				block.TRACT = block.CENSUS_BLOCK.substring(5,11);
				block.BLOCK = block.CENSUS_BLOCK.substring(11,15);
			}
			db.collection('blocks').save(block);	
		});
		console.log("Finished splitting codes");
	}, (err) => {
		console.log('Unable to get blocks', err);
	});	
};

function cleanAggregationFields(db){
	db.collection('blocks').find({}).toArray().then((blocks) => {
		console.log("Total Blocks:", blocks.length);
		var checked_fields = getAggregationFields();

		blocks.forEach(function(block){
			var updateSet = {};
			for (var i = 0; i < checked_fields.length; i++){
				var field = checked_fields[i];
				if (block[field] == '' || block[field] == null || block[field] == undefined){
					block[field] = 0;
				}
			};

			db.collection('blocks').save(block);
		});
		console.log("Finish updating");
	});
}

function getAggregationFields(){
	var aggregation_fields = [
		"KWH_JANUARY_2010", 
		"KWH_FEBRUARY_2010",
		"KWH_MARCH_2010",
		"KWH_APRIL_2010",
		"KWH_MAY_2010",
		"KWH_JUNE_2010",
		"KWH_JULY_2010",
		"KWH_AUGUST_2010",
		"KWH_SEPTEMBER_2010",
		"KWH_OCTOBER_2010",
		"KWH_NOVEMBER_2010",
		"KWH_DECEMBER_2010",
		"TOTAL_KWH",			
		"ZERO_KWH_ACCOUNTS",
		"THERM_JANUARY_2010", 
		"THERM_FEBRUARY_2010",
		"THERM_MARCH_2010",
		"THERM_APRIL_2010",
		"THERM_MAY_2010",
		"THERM_JUNE_2010",
		"THERM_JULY_2010",
		"THERM_AUGUST_2010",
		"THERM_SEPTEMBER_2010",
		"THERM_OCTOBER_2010",
		"THERM_NOVEMBER_2010",
		"THERM_DECEMBER_2010",
		"TOTAL_THERMS",
		"KWH_TOTAL_SQFT",
		"THERMS_TOTAL_SQFT",
		"TOTAL_POPULATION",
		"TOTAL_UNITS",
		"OCCUPIED_UNITS",
		"RENTER_OCCUPIED_HOUSING_UNITS",
		"OCCUPIED_HOUSING_UNITS"
	];
	// not consider GAS_ACCOUNTS and ELECTRICITY_ACCOUNTS in the aggregation
	// because of the "Less than 4" value
	return aggregation_fields;
}

function createCensusTracts(db){
	var aggregation_fields = getAggregationFields();
	var group = { "_id" : "$TRACT" };
	for (var i = 0; i < aggregation_fields.length; i++ ){
		group[aggregation_fields[i]] = {
			"$sum": "$" + aggregation_fields[i]
		}
	}
	console.log(JSON.stringify(group, undefined, 2));

	var cursor = db.collection('blocks').aggregate([
		{ "$group": group }
	]);

	cursor.toArray(function(error, results){
		if (error)
			return console.log("Error transforming cursor to array", error);

		results.forEach(function(tract){
			db.collection('blocks').findOne({ TRACT: tract._id }).then((block) => {
				tract.TRACT = tract._id;
				tract.STATE_FIPS = block.STATE_FIPS;
				tract.COUNTY_FIPS = block.COUNTY_FIPS;
				tract.COMMUNITY_AREA_NAME = block.COMMUNITY_AREA_NAME;
				tract._id = new ObjectID();
				db.collection('tracts').save(tract);
			}, (err) => {
				console.log(err);
			});
		});
		console.log("Finish inserting tracts");
	});
};

function addCommunityAreaNumbers(db){
	community_area_numbers.forEach((entry) => {
		var communities = db.collection('community_areas');
		communities.findOne({"COMMUNITY_AREA_NAME": entry["COMMUNITY AREA NAME"]}).then((community) => {
			community.COMMUNITY_AREA_NUMBER = entry["Community Area Number"];
			communities.save(community);
		}, (err) => {
			console.log(`Error searching community for ${entry["COMMUNITY AREA NAME"]}`);
		});
		console.log("Finished updating community area numbers");
	});
};

function addEnergyPropertiesToGeoCommunities(db){
	db.collection('geo_areas').find({}).toArray().then((geo_areas) => {
		geo_areas.forEach((geo_area) => {
			var community_number = parseInt(geo_area.properties.area_num_1);
			db.collection('community_areas').findOne({"COMMUNITY_AREA_NUMBER": community_number }).then((area) => {
				console.log(community_number + " " + area.TOTAL_THERMS + " - " + area.TOTAL_KWH);
				geo_area.properties["TOTAL_KWH"] = area.TOTAL_KWH;
				geo_area.properties["TOTAL_THERMS"] = area.TOTAL_THERMS;
				db.collection('geo_areas').save(geo_area);
			});
		});
	}, (e) => {
		console.log("Error obtaining the geocommunities", e);
	});
}

function addEnergyPropertiesToGeoTracts(db){
	db.collection('geo_tracts').find({}).toArray().then((geo_tracts) => {
		geo_tracts.forEach((geo_tract) => {
			var tractce10 = geo_tract.properties.tractce10.toString();
			db.collection('tracts').findOne({"TRACT": tractce10}).then((tract) => {
				if (tract == null){
					geo_tract.properties["TOTAL_KWH"] = -1;
					geo_tract.properties["TOTAL_THERMS"] = -1;
				} else {
					console.log(tractce10 + " " + tract.TOTAL_THERMS + " " + tract.TOTAL_KWH);
					geo_tract.properties["TOTAL_KWH"] = tract.TOTAL_KWH;
					geo_tract.properties["TOTAL_THERMS"] = tract.TOTAL_THERMS;
				}
				db.collection('geo_tracts').save(geo_tract);
			});
		});
	});
}

function addEnergyPropertiesToGeoBlocks(db){

	var cursorGeoBlocks = db.collection('geo_blocks').find({});
	cursorGeoBlocks.each((err, geo_block) => {
		var geoid = geo_block.properties.geoid10;
		var total_kwh = 0;
		var total_therms = 0;

		var cursorRelatedBlocks = db.collection('blocks').find({"CENSUS_BLOCK": geoid});
		cursorRelatedBlocks.each((err2, blocks) => {
			if (blocks && blocks.length > 0){
				for(var i = 0; i < blocks.length; i++){
					total_kwh += blocks[j].TOTAL_KWH;
					total_therms += blocks[j].TOTAL_THERMS;
				}
				geo_blocks[i].properties["TOTAL_KWH"] = total_kwh;
				geo_blocks[i].properties["TOTAL_THERMS"] = total_therms;
				db.collection('geo_blocks').save(geo_blocks[i]);
			}
		});
	});
}


function addTest(db){

	var qGeoBlocks = async.queue((geoblock, callback) => {
		var geoid = geoblock.properties.geoid10;

		var cursorRelatedBlocks = db.collection('blocks').find({"CENSUS_BLOCK": geoid});
		cursorRelatedBlocks.each((err, block) => {
			if (block) qBlocks.push({"block": block, "geoblock": geoblock});
		});
	}, Infinity);

	qGeoBlocks.drain = () => {
		console.log("Finished updating values");
	};

	var qBlocks = async.queue((doc, callback2) => {
			doc.geoblock.properties["TOTAL_KWH"] += doc.block.TOTAL_KWH;
			doc.geoblock.properties["TOTAL_THERMS"] += doc.block.TOTAL_THERMS;
	}, Infinity);

	qBlocks.drain = () => {
		db.collection('geo_blocks').save(doc.geoblock, callback2);
	}

	var cursorGeoBlocks = db.collection('geo_blocks').find({});
	cursorGeoBlocks.each((err, geo_block) => {
		if (geo_block){
			geo_block.properties["TOTAL_KWH"] = 0;
			geo_block.properties["TOTAL_THERMS"] = 0;
			qGeoBlocks.push(geo_block);	
		} 
	});
}	


function getMaxValues(db, collection_name){
	var min = 7035940,
		max = 0,
		sum = 0;

	console.log("min " + min);
	db.collection(collection_name).find({}).toArray().then((elems) => {
		for (var i = 0; i < elems.length; i++){
			if (elems[i].TOTAL_KWH === undefined){
				elems[i].TOTAL_KWH = -1;
			}
			if (elems[i].TOTAL_KWH > max) max = elems[i].TOTAL_KWH;
			if (elems[i].TOTAL_KWH != -1 &&
			    elems[i].TOTAL_KWH < min) min = elems[i].TOTAL_KWH;
			sum = sum + elems[i].TOTAL_KWH;
		}

		console.log("max:" + max);
		console.log("min:" + min);
		console.log("avg:" + sum / elems.length);
	});
}


// {
// 	"community_areas": {
// 		"max": 1,
// 		"min": 1
// 	},
// 	"tracts": {
// 		"max": 1,
// 		"min": 1
// 	},
// 	"blocks": {
// 		"max": 1,
// 		"min": 1
// 	}
// }