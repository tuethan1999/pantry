/*var express = require('express');
var url = require("url");

var bodyParser = require('body-parser'); // Required if we need to use HTTP post parameters
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP post parameters

// Mongo initialization and connect to database
// process.env.MONGODB_URI is the default environment variable on Heroku for the MongoLab add-on
// process.env.MONGOLAB_URI is the old environment variable on Heroku for the MongoLab add-on
// process.env.MONGOHQ_URL is an environment variable on Heroku for the MongoHQ add-on
// If environment variables not found, fall back to mongodb://localhost/nodemongoexample
// nodemongoexample is the name of the database
var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/ride_server';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});*/


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const mongo_url = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017';

// Database Name
const dbName = 'ingredient_list';

var toInsert = [
{"name": "tomatoes", "quantity": {"number": 3, "unit": "ct"}, "expiration": "2015-02-03"}, 
{"name": "beef", "Quantity": {"number": 1, "unit": "lbs"}, "expiration": "2015-02-03"}
];

// Use connect method to connect to the server
MongoClient.connect(mongo_url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  toInsert.forEach(function(ingredient) {
	  insertDocuments(db, ingredient, function(result) {
	    client.close();
	  });
  });
  
});

//Ex: {"ingredients": [{"Name": "tomatoes", "Quantity": {"number": 3, "unit": "ct"}, "expiration": "2015-02-03"}, 
//{"Name": "beef", "Quantity": {"number": 1, "unit": "lbs"}, "expiration": "2015-02-03"}] }

const insertDocuments = function(db, ingredient, callback) {
	// Get the documents collection
	const collection = db.collection('ingredients');
	var filter = { "name " : ingredient.name, "expiration" : ingredient.expiration };
	collection.update(filter, ingredient, function(err, result) {
	assert.equal(err, null);
	console.log(ingredient);
	callback(result);
	});
}