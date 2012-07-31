var app = require('express').createServer();

function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

//Open the DB
var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('rush-hour', server);
db.open(function(err, db) {
  if(!err) {
    console.log("Connected");
  }
});

app.get('/rush-hour.gif', function(req, res){
	var doc = {query:req.query, 
		params:req.params,
		clientIp:getClientIp(req),
		timestamp: new Date()};
	db.collection('requests', function(err, collection) {
	  collection.insert(doc, function(err, result) {
		if(!err) {
			res.send(doc);
		} else {
			res.send(err);
		}
	  });
	});
	//console.log("doc:",doc);
});

app.listen(8080);
