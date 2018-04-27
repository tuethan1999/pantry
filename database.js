var request = require('request');
var base_url = 'https://api.upcdatabase.org/product';
var api_key = 'FD9DB913EB715F95377CCD3E21086606';

function create_url(base, id, key)
{
	return base + '/' + id + '/' + key;
}
exports.get_info = function(barcode, callback)
{
	var complete_url = create_url(base_url, barcode, api_key);
	request(complete_url, function (error, response, body) {
	  console.log('error:', error);
	  console.log('statusCode:', response && response.statusCode); 
	  console.log('body:', body);
	  callback(body);
	});	
}