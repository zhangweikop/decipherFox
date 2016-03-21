function dataStoreWraper(dataStore) {
	if(!dataStore.store) {
		dataStore.store = [];
		dataStore.lock = [];
		dataStore.processingStore = {};
		dataStore.backgroundTasks = [];

		var clearTask = function() {
			/*
			var keys=[];
			for(var key in dataStore.processingStore) {
				if(dataStore.processingStore.hasOwnProperty(key)) {
					if(dataStore.processingStore[key]<0) {
						keys.push(key);
					}
				}
			}
			for(var i = 0; i < keys.length; i++) {
				delete dataStore.processingStore[keys[i]];
			}
			setTimeout(clearTask, 5000);
			*/
		}
		dataStore.backgroundTasks.push(clearTask);
	} else {
		return dataStore;
	}
	var store = dataStore.store;
	var processingStore = dataStore.processingStore;
	dataStore.acuireLock = function(){
	}

	// remove from the data store
	dataStore.remove = function(key) {

	}
	dataStore.enqueue = function(key, value) {
		store.push({key:key, value: value});
		return true;
	}
	dataStore.finishTask = function(key, description) {
		if(processingStore[key]) {
			processingStore[key].status = 1;
			processingStore[key].description = description;
		}
	};
	dataStore.fetchFinished = function(key) {
		if (!processingStore.hasOwnProperty(key)) {
			return false;
		}
		if(processingStore[key].status > 0) {
			processingStore[key].status = -1;
			var finishKey = key;
			setTimeout(function() {
				delete processingStore[finishKey];
			},40*1000);
			return processingStore[key].description;
		} else {
			return null;
		}
	}
	dataStore.dequeue = function() {
		var foundOne = false;
		var task;
		while(!foundOne&& store.length>0) {
			task = store.shift();
			if(processingStore[task.key]) {
				foundOne = false;
				task = null;
			} else {
				processingStore[task.key] = {img: task.value, status: 0, description: ''};
				var oldTask = task;
				setTimeout(function() {
					store.push(oldTask);
				},80*1000);
				foundOne = true;
			}
		}
		if(task) {
			return task;
		} else {
			return null;
		}
	}

	//start background task
	for(var i = 0; i < dataStore.backgroundTasks.length; i++) {
		dataStore.backgroundTasks[i]();
	}
}
module.exports = dataStoreWraper;