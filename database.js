var request = require('request');
var base_url = 'https://api.upcdatabase.org/product';
var product_id = '046838040597';
var api_key = 'FD9DB913EB715F95377CCD3E21086606';
var url = create_url(base_url, product_id, api_key);

function create_url(base, id, key)
{
	return base + '/' + id + '/' + key;
}
request(url, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});