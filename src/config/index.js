'use strict';

const path = require('path');
const crypto = require("crypto");

module.exports = {
	api_host: "http://api.xinziji.com/",
	db_root: path.join(__dirname, "../db"),

	secret: '3071a2a48fe6cbd04f1a129098e308f8', /* used in signing the cookies tokens */
	cacheTime: 7 * 24 * 60 * 60 * 1000, /* default caching time (7 days) for static files, calculated in milliseconds */

};
