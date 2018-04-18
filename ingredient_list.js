//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//												SETUP MONGO/EXPRESS

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var url = require("url");

var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

app.use(express.static(__dirname + '/html'));

//allow cross-origin headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Connection URL
const mongo_url = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/ingredient_list';

var updated_ingredient_list = [
{"name": "tomatoes", "quantity": 323, "unit": "ct", "expiration": "2015-02-03"}, 
{"name": "beef", "quantity": -5, "unit": "lbs", "expiration": "2015-02-03"}
];

// connect to server
var db = MongoClient.connect(mongo_url, function(err, client) {
	assert.equal(null, err);
	console.log("Connected successfully to server");
	const db = client;

 	//anything thats less that or equal to 0 quantity is deleted
	var remove_criteria = { "quantity": { $lte: 0 }};
	updated_ingredient_list.forEach(function(ingredient) {
		insertIngredients(db, ingredient, function(result) {
			removeIngredients(db, remove_criteria, function(remove_response){
	  		});
	  	});
  	});

	// return all the ingrdients after a 1 second delay
	setTimeout(function() {retrieveIngredients(db, {}, function(all_ingredients){
		console.log(all_ingredients);
	});}, 1000);
	
  
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//												SERVER RESPONSES

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var error_object = {"error":"Whoops, something is wrong with your data!"};

app.post('/ingredients', function(request, response) {
	var body = request.body;
	if(!(body.hasOwnProperty("username") && body.hasOwnProperty("password")
	 && body.hasOwnProperty("ingredients") && Object.keys(body).length == 3))
	{
		response.send(error_object);
	}
	else
	{
	}
});











//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//												MONGO FUNCTIONS

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const insertIngredients = function(db, ingredient, callback) {
	var filter = { "name" : ingredient.name, "expiration" : ingredient.expiration };
	console.log(filter);
	db.collection('ingredients', function(err, collection) {
		collection.update(filter, ingredient, {upsert:true}, function(err, results) {
			assert.equal(err, null);
			//console.log(ingredient);
			callback(results);
		});
	});
}
const retrieveIngredients = function(db, filter, callback)
{
	db.collection('ingredients', function(error, collection) {
		collection.find(filter).toArray(function(err, results) {
			assert.equal(err, null);
			callback(results);
		});
	});
}
const removeIngredients = function(db, filter, callback)
{
	db.collection('ingredients', function(error, collection) {
		collection.remove(filter, function(err, results){
			assert.equal(err, null);
			callback(results);
		});
	});
}


