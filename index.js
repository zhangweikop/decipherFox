"use strict";
var EventEmitter = require('events');
var util = require('util');
var express = require('express');
var simpleDataStore = require('./dataStore.js')
var apiRouter = require('./api.js');
var UserInfo = require('./userManagement.js');
var jsResource = express.static('./scripts');

var app = express();

app.use('/scripts', jsResource);


var redisInstance = false;
var dataStore = {};
var dataStoreConfiguration = {
    capacity : 1000,
    additionalLife: 40*1000,
    rollbackTime: 65*1000};
if(redisInstance) {
	//initialize and connect to the Redis Store.
	// the Redis is recommended to run on Linux.
} else {
	simpleDataStore(dataStore, dataStoreConfiguration);
	apiRouter.initializeDataStore(dataStore);
}


//initialize the defer response support
function DeferResponseList(){}

util.inherits(DeferResponseList, EventEmitter);

var deferResponseList = new DeferResponseList();

apiRouter.initializeDeferResponseList(deferResponseList);


var usersInfo = UserInfo(true, 20*1000);

apiRouter.initializeUsersInfo(usersInfo);

var authNormalUser = apiRouter.normalAuthHandler;
var authAdMinUser = apiRouter.adminAuthHandler 


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

app.get('/upload',  function (req, res, next) {
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

var htmlUpload2 = 'fileUploadLong.html';

app.get('/uploadLong', function (req, res, next) {
  res.sendFile(htmlUpload2, options, function (err) {
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
app.get('/manager', authAdMinUser, function (req, res, next) {
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
app.get('/decipher', authNormalUser, function (req, res, next) {
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