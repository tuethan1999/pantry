const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

var toInsert = [
{"Name": "tomatoes", "Quantity": {"number": 3, "unit": "ct"}, "expiration": "2015-02-03"}, 
{"Name": "beef", "Quantity": {"number": 1, "unit": "lbs"}, "expiration": "2015-02-03"}
];

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  insertDocuments(db, toInsert, function() {
    client.close();
  });
});

//Ex: {"ingredients": [{"Name": "tomatoes", "Quantity": {"number": 3, "unit": "ct"}, "expiration": "2015-02-03"}, 
//{"Name": "beef", "Quantity": {"number": 1, "unit": "lbs"}, "expiration": "2015-02-03"}] }

const insertDocuments = function(db, ingredient_list, callback) {
	// Get the documents collection
	const collection = db.collection('ingredients');
	// Insert some documents
	collection.insertMany(ingredient_list, function(err, result) {
	assert.equal(err, null);
	assert.equal(2, result.result.n);
	assert.equal(2, result.ops.length);
	console.log("Inserted 2 ingredients into the collection");
	callback(result);
	});
}