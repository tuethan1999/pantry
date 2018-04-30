var request = require('request');
var base_url = 'https://api.upcdatabase.org/product';
var api_key = '280B3939EBE634E88DE7BDC6290B65E2';

function create_url(base, id, key)
{
	return base + '/' + id + '/' + key;
}
exports.get_info = function(barcode, callback)
{
	var complete_url = create_url(base_url, barcode, api_key);
	request(complete_url, function (error, response, body) {
	 // console.log('error:', error);
	  //console.log('statusCode:', response && response.statusCode); 
	  //console.log('body:', body);

	  callback(JSON.parse(body));
	});	
}