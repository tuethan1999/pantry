var database = require('./database');
database.get_info('0022000005120', function(data){
	console.log(data.description);
});