var fs = require('fs');
function loadUserInfo (clearScore, backUpInterval) {
  var jsonString = fs.readFileSync('./users/user.txt', 'utf8');
  if(jsonString.length === 0) {
    jsonString === '{}';
  }
  var usersObject = JSON.parse(jsonString);
  for(var user in usersObject) {
    if(usersObject.hasOwnProperty(user)) {
      if(clearScore || !usersObject.total) {
       usersObject[user].total = 0;
       usersObject[user].correct = 0;
       usersObject[user].unvirified = 0;

      } 
    }
  }
  function saveToDisk() {
    fs.writeFile('./users/user.txt', JSON.stringify(usersObject), function(err){
      if (err) {
        console.log('err when save user info');
        throw err;}
    });
  }
  (function backUpPeriodically(){
      saveToDisk();
      setTimeout(backUpPeriodically, backUpInterval);
  })();
  function getUserStats(userName){
    if(usersObject.hasOwnProperty(userName)) {
       return {userName: userName,
              total: usersObject[userName].total, 
              correct: usersObject[userName].correct,
              unvirified: usersObject[userName].unvirified};
    } else {
      return null;
    }
  }
  function updateUserStats(userName, total, correct, unvirified){
     if(usersObject.hasOwnProperty(userName)) {
        if(total)
          { usersObject[userName].total += total;}
        if(correct)
          { usersObject[userName].correct += correct;}
        if(unvirified)
          { usersObject[userName].unvirified += unvirified;}
     }
  }
  function verifyUser(userName, pass) {
    if(usersObject.hasOwnProperty(userName) && usersObject[userName].password === pass)
      return true;
    return false;
  }
  function addUser(userName, pass, total, correct, unvirified){
     if(usersObject.hasOwnProperty(userName)){
        return false;
     }
     usersObject[userName] = {};
     usersObject[userName].password = pass;
   
     usersObject[userName].total = total||0;
     usersObject[userName].correct = correct||0;
     usersObject[userName].unvirified = unvirified|| 0;
     saveToDisk();
     return true;
  }
  function getAllUsers(){
    var result = [];
    for(var key in usersObject){
      if(usersObject.hasOwnProperty(key)){
        result.push(getUserStats(key));
      }
    }
    return result;
  }
  return {
    usersInfo: usersObject,
    verifyUser: verifyUser,
    addUser: addUser,
    getUserStats: getUserStats,
    getAllUsers: getAllUsers,
    updateUserStats: updateUserStats,
    saveInfoSync: saveToDisk
  };
}

module.exports = loadUserInfo;