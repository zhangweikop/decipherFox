"use strict";
var EventEmitter = require('events');
var eventEmitter = new EventEmitter.EventEmitter();

function dataStoreWraper(dataStore, dataStoreConfiguration) {
	if(!dataStore.store) {
		dataStore.store = [];
		dataStore.lock = [];
		dataStore.processingStore = {};
		dataStore.backgroundTasks = [];
		dataStore.messager = eventEmitter;
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
	dataStore.getImage = function(id){
		if(processingStore.hasOwnProperty(id)){
			return processingStore[id]; 
		}
		for(var i =0;i<store.length;i++){
			if(id=== store[i].key){
				return store[i];
			}
		}
		return null;

	}
	dataStore.getAllInfo = function () {
		var waitings = [];
		var processings = [];
		for(var i = 0; i < store.length; i++) {
			waitings.push({key: store[i].key, enqueueTime: store[i].enqueueTime});
		}
		for(var key in processingStore){
			if(processingStore.hasOwnProperty(key))
			{
			 processings.push({key: key, worker: processingStore[key].worker, status: processingStore[key].status,
								enqueueTime: processingStore[key].enqueueTime,
								dequeueTime: processingStore[key].dequeueTime,
								finishTime: processingStore[key].finishTime});
			}
		}
		return{waitings: waitings, processings:processings};
	}
	//try remove from the data store
	dataStore.tryRemove = function(key) {
		dataStore.messager.emit('remove'+key);
	}
	dataStore.enqueue = function(key, value, removeAction) {
		store.push({key:key, value: value, status:0, enqueueTime: Date.now()});
		if(removeAction) {
			dataStore.messager.once('remove'+key, removeAction);
		}
		while(store.length > dataStoreConfiguration.capacity/2) {
			var data = store.shift();
			this.tryRemove(data.key);
		}
		return true;
	}
	dataStore.finishTask = function(key, description, finishAction) {
		var updated = false;
		if(processingStore[key] ) {
			updated = (processingStore[key].status !== 2);
			processingStore[key].status = 2;
			processingStore[key].description = description;
			processingStore[key].finishTime = Date.now();
			if(finishAction)
			{
				finishAction();
			}
		} else {
			return null;
		}
		return updated;
	};
	dataStore.fetchFinished = function(key) {
		if (!processingStore.hasOwnProperty(key)) {
			return false;
		}
		if(processingStore[key].status == 2) {
			processingStore[key].status = 3;

			if (dataStoreConfiguration.additionalLife > 0) {
				var finishKey = key;
				setTimeout(function() {
					delete processingStore[finishKey];
				},dataStoreConfiguration.additionalLife);
			}
			return processingStore[key].description;
		} else {
			return null;
		}
	}
	dataStore.dequeue = function(worker) {
		var foundOne = false;
		var task;
		while(!foundOne&& store.length>0) {
			task = store.shift();
			if(processingStore[task.key]) {
				foundOne = false;
				task = null;
			} else {
				processingStore[task.key] = {value: task.value, status: 1, description: null, worker: worker,
											enqueueTime: task.enqueueTime,
											dequeueTime: Date.now()};
				var oldTask = task;
				setTimeout(function() {
					if(processingStore[oldTask.key] && (processingStore[oldTask.key].status === 1)) {
						store.unshift(oldTask);
						delete processingStore[task.key];
					}
				},dataStoreConfiguration.rollbackTime);
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