const PouchDB = require('pouchdb');

function BlogService($q) {
    return {
    	getAccounts: getAccounts,
        saveSinaCrawlAccount: saveSinaCrawlAccount,
        saveSinaBlogAccount: sina.saveBlogAccount,
        removeBlogAccount: removeBlogAccount
    };

    function getAccounts(){
    	that.db.account.find({}, function(err, docs){
				event.returnValue = docs;
			});
    }
    
    function saveSinaCrawlAccount() {
    	var deferred = $q.defer();
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


            var query = "SELECT * FROM customers";
            connection.query(query, function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            return deferred.promise;
        }
}

angular
    .module('inspinia')
    .controller('BlogService', BlogService)