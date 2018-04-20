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

// allow cross-origin headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Connection URL
const mongo_url = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/ingredient_list';

var updated_ingredient_list = [
{"name": "tomatoes", "quantity": 4, "unit": "ct", "expiration": "2015-02-03"}, 
{"name": "beef", "quantity": 2, "unit": "lbs", "expiration": "2015-02-03"}
];

// connect to server
var db = MongoClient.connect(mongo_url, function(err, client) {
	assert.equal(null, err);
	console.log("Connected successfully to server");
	const db = client;
	
  
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//												SERVER RESPONSES

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var error_object = {"error":"Whoops, something is wrong with your data!"};

// accepts post to /ingredients
app.post('/ingredients', function(request, response) {
	var body = request.body;
	if(!valid_data(body))
	{
		response.send(error_object);
	}
	else
	{
		// copy request body
		var username = request.body.username;
		var password = request.body.password;
		var updated_ingredient_list = request.body.ingredients;

		// check for funny business
		username = username.replace(/[^\w\s]/gi, '');
		password = password.replace(/[^\w\s]/gi, '');

		// check for funny business cont. /make ingredient quanitity a float number
		updated_ingredient_list.forEach(function(ingredient)
		{
			ingredient.name = ingredient.name.replace(/[^\w\s]/gi, '');
			ingredient.quantity = ingredient.quantity.replace(/[^\w\s]/gi, '');
			ingredient.quantity = parseFloat(ingredient.quantity);
			ingredient.unit = ingredient.unit.replace(/[^\w\s]/gi, '');
			ingredient.expiration = ingredient.expiration.replace(/[^\w\s]/gi, '');
		});

		// haven't decided how to implement multiple user, but this will be neccessary
		var insert_search_query = { "username": username};
		console.log(updated_ingredient_list);

		// update ingredients
		updateIngredients(db, updated_ingredient_list);
		// return all the ingrdients after 5 milliseconds per ingredient
		setTimeout(function() {retrieveIngredients(db, {}, function(all_ingredients){
			console.log(all_ingredients);
		});}, 5*updated_ingredient_list.length);
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

const updateIngredients = function(db, ingredient_list)
{
 	// anything thats less than or equal to 0 quantity is deleted
	var remove_criteria = { "quantity": { $lte: 0 }};
	ingredient_list.forEach(function(ingredient) {
		insertIngredients(db, ingredient, function(result) {
			removeIngredients(db, remove_criteria, function(remove_response){
	  		});
	  	});
  	});
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//												HELPER FUNCTIONS

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const valid_data = function(body)
{
	// check for username, password, ingredients.
	if(!(body.hasOwnProperty("username") && body.hasOwnProperty("password")
	&& body.hasOwnProperty("ingredients") && Object.keys(body).length == 3))
	{
		return false;
	}
	else
	{
		var ingredient_list = request.body.ingredients;
		// check each ingredient for name, quantity, unit, expiration
		ingredient_list.forEach(function(ingredient) {
			if(!(ingredient.hasOwnProperty("name") && ingredient.hasOwnProperty("quantity")
	 		&& ingredient.hasOwnProperty("unit") && ingredient.hasOwnProperty("expiration") && 
	 		Object.keys(ingredient).length == 4))
	 		{
	 			return false;
			}
		});
	}
}
