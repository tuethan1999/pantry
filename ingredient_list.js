//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//												SETUP MONGO/EXPRESS

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var url = require("url");
var unirest = require('unirest');

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
{"name": "tomatoes", "quantity": 234, "unit": "ct", "expiration": "2015-02-03"}, 
{"name": "beef", "quantity": 2234234234, "unit": "lbs", "expiration": "2015-02-03"}
];

// connect to server
var db = MongoClient.connect(mongo_url, function(err, client) {
	assert.equal(null, err);
	console.log("Connected successfully to server");
	db = client;
	
  
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
		//var username = request.body.username;
		//var password = request.body.password;
		var updated_ingredients = request.body.ingredients;

		// check for funny business
		//username = username.replace(/[^\w\s]/gi, '');
		//password = password.replace(/[^\w\s]/gi, '');
		// check for funny business cont. /make ingredient quanitity a float number
		updated_ingredients.forEach(function(ingredient)
		{
			ingredient.name = ingredient.name.replace(/[^\w\s]/gi, '');
			//ingredient.quantity = ingredient.quantity.replace(/[^\w\s]/gi, '');
			ingredient.quantity = parseFloat(ingredient.quantity);
			ingredient.unit = ingredient.unit.replace(/[^\w\s]/gi, '');
			//ingredient.expiration = ingredient.expiration.replace(/[^\w\s]/gi, '');
		});

		// haven't decided how to implement multiple users, but this will be neccessary
		var insert_search_query = { "username": username};

		// update ingredients
		updateIngredients(db, updated_ingredients);
		// return all the ingrdients after 5 milliseconds per ingredient
		setTimeout(function() {retrieveIngredients(db, {}, function(all_ingredients){
			var list = JSON.stringify(all_ingredients);
			response.send(list);
		});}, 5*updated_ingredients.length);
	}
});

app.get('/recipes', function(request,response){
	retrieveIngredients(db, {}, function(ingred){
		var ingred = request.body.ingred;
		console.log(ingred);
			unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients?fillIngredients=false&ingredients="+ingred+"&limitLicense=false&number=1&ranking=1")
			.header("X-Mashape-Key", "j2fHvkZ8mCmshWk9ssoVRX7VfpiXp1sAi9CjsnSZJkZIqdWNlT")
			.header("Accept", "application/json")
			.end(function (result) {
		var testID = result.body[0].id;
		console.log(testID); // we have recipe ID
			unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/"+testID+"/information?includeNutrition=true")
			.header("X-Mashape-Key", "j2fHvkZ8mCmshWk9ssoVRX7VfpiXp1sAi9CjsnSZJkZIqdWNlT")
			.header("Accept", "application/json")
			.end(function (result2) {
		console.log(result2.body); // we have recipe info
		var allData = result2.body;
			response.send(allData);
		// var htmldat = "<!DOCTYPE html><html><head><title> Recipe </title><meta charset = \"utf-8\" /><link rel=\"stylesheet\" href=\"style.css\" type=\"text/css\" /></head><body>";
		  	
		//   	response.send(htmldat+htmlEnd);
			});
		});
	});
});

var database = require('./database');
app.post('/barcode', function(request, response) {
	var body = request.body;
	if(!(body.hasOwnProperty("barcode") && Object.keys(body).length == 1))
	{
		response.send(error_object);
	}
	else
	{
		var barcode = request.body.barcode;
		database.get_info(barcode, function(data){
			response.send(data.description);
		});
	}	
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//												MONGO FUNCTIONS

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const insertIngredients = function(db, ingredient, callback) {
	var filter = { "name" : ingredient.name, "expiration" : ingredient.expiration };
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
	if(!body.hasOwnProperty("ingredients"))
	{
		console.log(body);
		return false;
	}
	else
	{
		console.log(body);
		var ingredient_list = body.ingredients;
		console.log(ingredient_list);
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
	return true;
}

app.listen(process.env.PORT || 3000);