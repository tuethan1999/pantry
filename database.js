var request = require('request');
var base_url = 'https://api.upcdatabase.org/product';
var product_id = '046838040597';
var api_key = 'FD9DB913EB715F95377CCD3E21086606';
var url = create_url(base_url, product_id, api_key);

get_info(url);

function create_url(base, id, key)
{
	return base + '/' + id + '/' + key;
}
function get_info(complete_url)
{
	request(complete_url, function (error, response, body) {
	  console.log('error:', error);
	  console.log('statusCode:', response && response.statusCode); 
	  console.log('body:', body); 
	});	
}
