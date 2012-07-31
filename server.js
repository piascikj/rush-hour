var _ = require('underscore');
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

function onRequest(req, res){
	console.log("body:",req.body);
	var doc = {
		query_params:req.query, 
		body:req.body,
		clientIp:getClientIp(req),
		cookies:req.cookies,
		timestamp: new Date()
	};
	
	var nCookies = {};
	_.each(doc.cookies, function(val, key) {
		nCookies[key.replace(".","_dot_")] = val;
	});
	
	doc.cookies = nCookies;
	
	console.log("doc:",doc);
	
	db.collection('requests', function(err, collection) {
	  collection.insert(doc, function(err, result) {
		if(!err) {
			res.send(doc);
		} else {
			res.send(err);
		}
	  });
	});
}


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

//Start the server
var express = require('express');
var app = express.createServer();

app.use(express.cookieParser());
app.use(express.bodyParser());

app.get('/rush-hour.gif', onRequest);
app.post('/rush-hour.gif', onRequest);

app.listen(8080);
