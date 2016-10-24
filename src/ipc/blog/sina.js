'use strict';
const path = require('path');
const xmlrpc = require('xmlrpc');
const request = require('superagent');
const async = require('async');
const cheerio = require('cheerio');
const Datastore = require('nedb');
const {ipcMain} = require('electron');

//const UpdateHandler = require('./handlers/update');


class sina {
	constructor(db) {
		this.metaweblog = xmlrpc.createClient("http://my.oschina.net/action/xmlrpc");
		this.db = db;
	}

	crawl_aboutme(about_url, event){
		let that = this;
		let blogid = about_url.split('_')[1].slice(0,-5);
		request.get(about_url).end((err,res) => {
			if(err) return console.log(err);
			let $ = cheerio.load(res.text);
			let url = $(".blognavInfo a").first().attr("href");
			let nick = $('#ownernick').text();
			let avatar = $(".info_img img").attr("src");
			let desc = $(".personIntro").text();
			let upd_at = new Date();
			that.db.account.findOne({is_owner: false, platform: "sina", url: url}, (err, doc) => {
				if(doc){
					let timeline = {title: "重新获取账号信息", at: upd_at};
					that.db.account.update({_id: doc._id}, { $set: {blogid: blogid, nick: nick, avatar: avatar, desc: desc, upd_at: upd_at}, $push: {timelines: timeline}}, {}, (err) => {
						doc.url = url;
						doc.blogid = blogid;
						doc.nick = nick;
						doc.avatar = avatar;
						doc.desc = desc;
						doc.upd_at = upd_at;
						doc.timelines.push(timeline)
						event.sender.send('mod_blog_account', doc);
					});
				}else{
					let timeline = {title: "获取账号信息", at: upd_at};
					that.db.account.insert({is_owner: false, platform: "sina", url: url, blogid: blogid, nick: nick, avatar: avatar, desc: desc, upd_at: upd_at, total: 0, crawled: 0, timelines: [timeline]}, (err, newDoc) => {
						event.sender.send('new_blog_account', newDoc);
					});
				}
			});
		});
	}

	crawl_list(list_url, event){
		console.log("crawl_aboutme");
		let that = this;
		let blogid = list_url.split('_')[1];
		this.crawl_list_page(blogid, 1, [], 0, (err, urls) => {
			if(err) console.log(err);
			that.db.account.update({platform: "sina", blogid: blogid}, {$set: {total: urls.length}}, {}, (err) => {
				event.sender.send("mod_crawl_total", {platform:"sina", blogid: blogid, total: urls.length});
			});
			async.eachSeries(urls, (url, callback) => {  
			    that.crawl_article(url, (err,item) =>{  
			    	console.log(url);
			    	that.db.article.findOne({sina_id: item.sina_id}, (err, doc) => {
			    		if(doc){
			    			//已抓取，不做操作
			    		}else{
			    			that.db.article.insert(item, (err, newDoc) => {
			    				event.sender.send('new_crawl_article', newDoc);
			    				event.sender.send("mod_crawl_total", {platform:"sina", blogid: blogid, total: urls.length});
			    			});
						}
						callback(err);
			    	});
			    });  
			}, (err) => {  
			    console.log("err is:" + err);  
			});  
		});
	}

	crawl_list_page(blogid, page, urls, total, callback){
		let that = this;
		request.get("http://blog.sina.com.cn/s/articlelist_" + blogid + "_0_" + page + ".html").end((err, res) => {
			if(err) return callback(err);
			let page_urls = [];
			let $ = cheerio.load(res.text);
			$('.articleCell a.title').each(function(i, elem) {
  				page_urls[i] = $(this).attr("href");
			});
			if(page === 1) total = parseInt($(".SG_dot em").text().slice(1,-1));
			urls = urls.concat(page_urls);
			if(urls.length < total){
				page++;
				that.crawl_list_page(blogid, page, urls, total, callback);
			}else{
				callback(null, urls)
			}
		});
	}

	crawl_article(url, callback){
		request.get(url).end((err, res) => {
			if(err) return callback(err);
			let $ = cheerio.load(res.text);
			let item = {
				sina_id: url.split('_')[1].slice(0,-5), 
				title: $('.titName').text(),
				content: $('.articalContent').html(),
			}
			callback(err, item);
		});
	}

	init() {
		const that = this;

		ipcMain.on("save_sina_crawl_account",(event, url) => {
			request.get(url).end((err,res) => {
				let $ = cheerio.load(res.text);
				let list_url = $(".blognavInfo a").eq(1).attr("href");
				let img_url = $(".blognavInfo a").eq(2).attr("href");
				let about_url = $(".blognavInfo a").eq(3).attr("href");
				const dt = new Date();
				console.log(list_url);
				console.log(img_url);
				console.log(about_url);
				that.crawl_aboutme(about_url, event);
				that.crawl_list(list_url, event);
			})
		});

		ipcMain.on("save_sina_blog_account", (event, username, password) => { 
			const dt = new Date();
			that.db.account.findOne({is_owner: true, platform: "sina", username: username}, function(err, doc){
				if(doc){
					that.db.account.update({is_owner: true, platform: "sina", username: username}, { $set: {password: password, upd_at: dt}}, {}, function(){});
					doc.password = password;
					doc.upd_at = dt;
					event.sender.send('mod_blog_account', doc);
				}else{
					that.db.account.insert({is_owner: true, platform: "sina", username: username, password: password, upd_at: dt}, function(err, newDoc){
						event.sender.send('new_blog_account', newDoc);
					});
				}
			});
		});

	}

}



module.exports = sina;