var express = require('express');
var simpleDataStore = require('./dataStore.js')
var apiRouter = require('./api.js');

var jsResource = express.static('./scripts');

var app = express();

app.use('/scripts', jsResource);


var redisInstance = false;
var dataStore = {};
if(redisInstance) {
	//initialize and connect to the Redis Store.
	// the Redis is recommended to run on Linux.
} else {
	simpleDataStore(dataStore);
	apiRouter.initializeDataStore(dataStore);
}

var options = {
    root : '.',
    headers: {
        'content-type': 'text/html; charset=utf-8',
        'Connection': 'keep-alive'
    }
  };

var htmlHome = 'homePage.html';

app.get('/', function (req, res, next) {
  res.sendFile(htmlHome, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      //console.log('Sent:', fileName);
    }
  });
});

app.use('/api', apiRouter);


var htmlUpload = 'fileUpload.html';

app.get('/upload', function (req, res, next) {
  res.sendFile(htmlUpload, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      //console.log('Sent:', fileName);
    }
  });
});


var htmlManager = 'manager.html';
app.get('/manager', function (req, res, next) {
  res.sendFile(htmlManager, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      //console.log('Sent:', fileName);
    }
  });
});

var htmlDecipher = 'decipherFile.html';
app.get('/decipher', function (req, res, next) {
  res.sendFile(htmlDecipher, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      //console.log('Sent:', fileName);
    }
  });
});

app.get('*', function(req, res){
  res.status(404).send('page not found!');
});

function start() {
	var port = process.argv[2];
	var server = app.listen(port || 8080, function () {
  		var host = server.address().address
  		var port = server.address().port;
 		console.log('app listening at http://%s:%s', host, port);		
	});
}
start();