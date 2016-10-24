/**
 * codeEditorCtrl - Controller for code editor - Code Mirror
 */

const {ipcRenderer} = require('electron');
const PouchDB = require('pouchdb');

function BlogCtrl($scope, $timeout) {
    $scope.db = {
        account: new PouchDB( '../db/blog.account.db'), autoload: true }),
        article: new PouchDB({ filename: path.join(__dirname, '../db/blog.article.db'), autoload: true })
    };
    var db = new PouchDB("blog.account.db");

    $scope.platforms = [
        {platform: "sina", title: "新浪博客", metaweblog: true, note: ""},
        {platform: "csdn", title: "csdn博客", metaweblog: true, note: ""},
    ];
    $scope.platform = "sina";
    $scope.platform_crawl = "sina";
    $scope.blog_accounts = ipcRenderer.sendSync('get_blog_accounts') || [];
    console.log($scope.blog_accounts);

    $scope.new_account = (item) =>{
        console.log($scope.blog_accounts);
        console.log(item);
        $scope.blog_accounts.unshift(item);    
    } 
    
    $scope.$on('new_blog_account', (event, arg) => {
        $scope.blog_accounts.unshift(arg);
    });

    ipcRenderer.on('mod_blog_account', (event, arg) => {
        $timeout(() => { $scope.blog_accounts.forEach((item) =>{ if(item._id === arg._id){ item = arg; } }); }, 0);
    });

    ipcRenderer.on('mod_crawl_total', (event, arg) => {
        $scope.blog_accounts.forEach((item) =>{ if(item.platform === arg.platform && item.blogid === arg.blogid){ item.total = arg.total; } });
    });

    ipcRenderer.on('new_crawl_article', (event, arg) => {
        $scope.blog_accounts.unshift(arg);
    });

    $scope.compose = function(){
        console.log(ipcRenderer.sendSync('blog_test', 'ping')) // prints "pong"
        console.log("here");
    }

    $scope.save_crawl_account = function(){
        var channel = 'save_' + $scope.crawl_platform + '_crawl_account';
        console.log(channel);
        console.log($scope.crawl_url);
        ipcRenderer.send(channel, $scope.crawl_url);
    }

    $scope.save_blog_account = function(){
        ipcRenderer.send('save_' + $scope.platform + '_blog_account', $scope.username, $scope.password);
    }

    $scope.remove_blog_account = function(item){
        $scope.blog_accounts = ipcRenderer.send('remove_blog_account', item._id);
        delete item;
        //const idx = $scope.blog_accounts.findIndex(item => item._id == id);
        //$scope.blog_accounts.splice(idx, 1);
    }

}

angular
    .module('inspinia')
    .controller('blogCtrl', blogCtrl)