	var http = require("http");
	//process.stdout.write("In rush");
	var options = {
	  host: 'localhost',
	  port: 8080
	};
	for (var i=0;i<30000;i++) {
		options.path = '/rush-hour.gif?id=' + i;
		http.get(options);
	}
