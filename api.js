var express = require('express');
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
// ...

router.post('/postUpload/file', uploadMul.any());
router.post('/postUpload/file',function(req, res) {
  //console.log(uploadMul.array())   

  if(!req.files || (req.files && req.files.length<=0)) {
    res.json(false);

  } else {

  var base64 = req.files[0].buffer.toString('base64');
    console.log('length is ', req.files[0].buffer.length);
    console.log('base64 length is', base64.length);

  var fileName = req.files[0].originalname;
  var uniqueId = Date.now()+ 'n' +Math.random();
  console.log('create a newfile:'+ uniqueId);
  //function() {res.send('File ' + req.files[0].originalname +' is saved under '+ router.folderName);})
  router.dataStore.enqueue(uniqueId, base64);
  res.json({ fileId: uniqueId });
  }

  
});

//{fileId: 123, fileDescription: 'abbcde'}
router.post('/postDeciphered/file', jsonParser, urlParser, function (req, res){
  var reqBody = req.body;
  if(reqBody.fileId) {
    router.dataStore.finishTask(reqBody.fileId, reqBody.fileDescription);
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

router.get('/getTask/file', function (req, res){
  var task = router.dataStore.dequeue();
  if(task) {
      res.json({fileId: task.key, fileContent:task.value});
  } else {
      res.json(false);
  }
});
