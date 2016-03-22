const EventEmitter = require('events');
var express = require('express');
var basicAuth = require('basic-auth');

var router = express.Router();
var multer = require('multer');
var bodyParser = require('body-parser');
var storage = multer.memoryStorage()
var uploadMul = multer({ storage: storage })

var router2 = express.Router();

module.exports = router;


var jsonParser = bodyParser.json(); // for parsing application/json
var urlParser = bodyParser.urlencoded({ extended: true }); // for parsing application/x-www-form-urlencoded

router.initializeDataStore = function(dataStore) {
  router.dataStore = dataStore;
}

router.initializeDeferResponseList = function(deferResponseList){
	router.deferResponseList = deferResponseList;

	deferResponseList.addDeferResponse = function(res, fileId){ 
		var that = this;
		res.on('close', function(){
			that.removeDeferResponse(fileId);
		});
		setTimeout(function(){
			deferResponseList.removeDeferResponse(fileId);
			if(!res.finished){
					res.json({fileId: fileId, 
	                description: null
	          		});
				}
			
				}, 60*1000);
  		this.once(fileId, function(fileDescription){
	     var description = router.dataStore.fetchFinished(fileId);
	      if(description === false || description=== null) {
	           res.json({fileId: fileId, 
	                description: null
	          });
	      }  else {
	          res.json({fileId: fileId, 
	                description: description
	          });
	      }
	  })
	};

	deferResponseList.sendDeferResponse = function(fileId) {
		this.emit(fileId);
	}
	deferResponseList.removeDeferResponse = function(fileId) {
		this.removeAllListeners(fileId);
	}

}
var admin={name: 'admin', pass:'WelcomeAdmin'};
router.initializeUsersInfo = function(usersInfo) {
	router.usersInfo = usersInfo;
	router.usersInfo.addUser(admin.name, admin.pass);
}

var authNormalUser = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if(router.usersInfo.verifyUser(user.name, user.pass)) {
    req.userName = user.name;
    req.password = user.pass;
    return next();
  } else {
    return unauthorized(res);
  };
};
var authAdMinUser = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };
  if(user.name === admin.name && user.pass === admin.pass) {
    return next();
  } else {
    return unauthorized(res);
  };
};

router.normalAuthHandler = authNormalUser;
router.adminAuthHandler = authAdMinUser;


router.post('/postUploadLong/file', uploadMul.any());
router.post('/postUploadLong/file',function(req, res) {
  //console.log(uploadMul.array())   

  if(!req.files || (req.files && req.files.length<=0)) {
    res.json(false);

  } else {
  	var base64 = req.files[0].buffer.toString('base64');
    
  	var fileName = req.files[0].originalname;
  	var uniqueId = Date.now()+ 'n' +Math.random();

  	console.log('create a newfile:'+ uniqueId);
    console.log('and its length is:', req.files[0].buffer.length);
	router.dataStore.enqueue(uniqueId, base64, function(){
		if(!res.finished) {
			res.json({fileId: fileId, 
	                description: null
	          });
		}
	});
  	router.deferResponseList.addDeferResponse(res, uniqueId);
  }
});

router.post('/postUpload/file', uploadMul.any());
router.post('/postUpload/file',function(req, res) {
  //console.log(uploadMul.array())   

  if(!req.files || (req.files && req.files.length<=0)) {
    res.json(false);

  } else {

  var base64 = req.files[0].buffer.toString('base64');
  
  var fileName = req.files[0].originalname;
  var uniqueId = Date.now()+ 'n' +Math.random();
    console.log('create a newfile:'+ uniqueId);
    console.log('and its length is:', req.files[0].buffer.length);
  //function() {res.send('File ' + req.files[0].originalname +' is saved under '+ router.folderName);})
  router.dataStore.enqueue(uniqueId, base64);
  res.json({ fileId: uniqueId });
  }

  
});





//{fileId: 123, fileDescription: 'abbcde'}
router.post('/postDeciphered/file', jsonParser, urlParser, router.normalAuthHandler, function (req, res){
  var reqBody = req.body;
  if(reqBody.fileId) {
    router.dataStore.finishTask(reqBody.fileId, reqBody.fileDescription);
    router.deferResponseList.sendDeferResponse(reqBody.fileId);
    var userName = req.userName;
    router.usersInfo.updateUserStats(userName, 1, 0, 1);
    res.json(true);
  } else {
    res.json(false);
  }
});

router2.get('*',  function (req, res){
  var id = req.path.split('/').pop();
  if(id) {
    var description = router.dataStore.fetchFinished(id);
    if(description === false) {
         res.json({fileExist: false});
    } else if( description=== null) {
          res.json({fileExist: true});
    } else {
        res.json({fileId: id, 
              description: description
        });
    }
  } else {
    res.json({fileExist: false});
  }
});

router.use('/getDeciphered/file/', router2);

router.get('/getTask/file', router.normalAuthHandler, function (req, res){
  var userName = req.userName;
  var task = router.dataStore.dequeue(userName);
  if(task) {
      res.json({fileId: task.key, fileContent:task.value});
  } else {
      res.json(false);
  }
});

router.get('/getUserStats', router.normalAuthHandler, function (req, res){
  var userName = req.userName;
  var info =  router.usersInfo.getUserStats(userName);

  res.json(info);
});

router.get('/getAllUser', router.adminAuthHandler, function (req, res){
  var infos =  router.usersInfo.getAllUsers();
  res.json(infos);
});

router.post('/addNewUser',  jsonParser, urlParser, router.adminAuthHandler, function (req, res){
   var reqBody = req.body;
  if(reqBody.userName && reqBody.password) {
  	 res.json(router.usersInfo.addUser(reqBody.userName, reqBody.password));
  } else {
  	res.json(false);
  }
});
