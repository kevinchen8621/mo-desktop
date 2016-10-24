'use strict';
const config = require('../config');
const path = require('path');
const request = require('superagent');
const Datastore = require('nedb');
const {ipcMain} = require('electron');

//const UpdateHandler = require('./handlers/update');


class User {
	constructor() {
		//this.db = new Datastore(path.join(config.db_root, "user.db");
		this.current_user = null;
	}

	init() {
		ipcMain.on("login", (event, username, password) => {
			console.log(username);
			console.log(password);

			// request.post(config.api_host + "/login").end(function(err, res){
			// 	console.log(res);
			// });
		});

		ipcMain.on("register", (event, username, email, password) => {
			request.post(config.api_host + "/register").end(function(err, res){
				console.log(res);
			});
		});
	}
}

module.exports = User;