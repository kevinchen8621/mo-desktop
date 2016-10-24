'use strict';
const config = require('../../config');
const path = require('path');
const xmlrpc = require('xmlrpc');
const request = require('superagent');
const cheerio = require('cheerio');
const Datastore = require('nedb');
const {ipcMain} = require('electron');

const sina = require('./sina');


class blog {
	constructor() {
		this.db = {
			account: new Datastore({ filename: path.join(__dirname, '../db/blog.account.db'), autoload: true }),
			article: new Datastore({ filename: path.join(__dirname, '../db/blog.article.db'), autoload: true })
		};
		this.sina = new sina(this.db);
	}

	init() {
		const that = this;
		this.sina.init();

		ipcMain.on("blog_test", (event) => {
			console.log("blog_test ipcMain");
			this.sinablog.methodCall('metaWeblog.getRecentPosts', ['0', '103777673@qq.com', 'd9irm57fy0', 10], function(err, data){
				console.log(err);
				console.log(typeof data);
				console.log(data);
				event.returnValue = data;
			});
		});

		ipcMain.on("get_blog_accounts", (event) => {
			that.db.account.find({}, function(err, docs){
				event.returnValue = docs;
			});
		});


		ipcMain.on("remove_blog_account", (event, id) => {
			that.db.account.remove({_id: id}, {}, function(err, numRemoved){
				//nothing to do
			});
		});

	}
}



module.exports = blog;