"use strict";
var EventEmitter = require('events');
var fs = require('fs');
var util = require('util');
var express = require('express');
var simpleDataStore = require('./dataStore.js')
var apiRouter = require('./api.js');
var UserInfo = require('./userManagement.js');
var jsResource = express.static('./scripts');

var app = express();

app.use('/scripts', jsResource);

var serverConfig = {};
try {
var configString = fs.readFileSync('./config.json', 'utf8');
  if(configString.length === 0) {
    configString = '{}';
  }
  var serverConfig = JSON.parse(configString);
  console.log('---------------------------------------')
  console.log('server config:')
  for(var key in serverConfig) {
     console.log(key + ':' + serverConfig[key]);
  }
  console.log('---------------------------------------')

}
catch(err) {
  serverConfig = {};
  console.log('The config file is not correct');
}



var redisInstance = false;
var dataStore = {};
var dataStoreConfiguration = {
    capacity : serverConfig.capacity || 1000,
    additionalLife: serverConfig.extrafilelife || 40*1000,
    rollbackTime:  serverConfig.maxwaitingtime || 120*1000};

if(redisInstance) {
	//initialize and connect to the Redis Store.
	// the Redis is recommended to run on Linux.
} else {
	simpleDataStore(dataStore, dataStoreConfiguration);
	apiRouter.initializeRouter(dataStore, serverConfig.posttimeout || 120*1000);
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

var htmlviewFile = 'viewFile.html';
app.get('/viewFile/*',  authAdMinUser, function (req, res, next) {
    fs.readFile(htmlviewFile, "utf8", function(err, data){
    if(err)  res.status(500).end();
  
    var id = req.path.split('/').pop();
    var resultHtml = data.replace('FILIDDILIF', id);
    res.send(resultHtml);
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

var htmlPractice = 'PracticedecipherFile.html';

app.get('/practice/decipher', authNormalUser, function (req, res, next) {
  res.sendFile(htmlPractice, options, function (err) {
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