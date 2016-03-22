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

	//try remove from the data store
	dataStore.tryRemove = function(key) {
		dataStore.messager.emit('remove'+key);
	}
	dataStore.enqueue = function(key, value, removeAction) {
		store.push({key:key, value: value});
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
		if(processingStore[key]) {
			processingStore[key].status = 1;
			processingStore[key].description = description;
			if(finishAction)
			{
				finishAction();
			}
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
			},dataStoreConfiguration.additionalLife);
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
				processingStore[task.key] = {img: task.value, status: 0, description: null, worker: worker};
				var oldTask = task;
				setTimeout(function() {
					if(processingStore[oldTask.key] && (!processingStore[oldTask.key].description)) {
						store.push(oldTask);
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