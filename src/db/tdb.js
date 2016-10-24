var TarantoolConnection = require('tarantool-driver');
var conn = new TarantoolConnection({port: 3301});

var Tdb = (function(){
  Tdb.defaultOptions = {
    host: 'localhost',
    port: '3301',
    log: false,
    msgpack: require('msgpack-lite'),
    timeout: 3000
  };

  Tarantool.connect = function(host, port) {
    return new Tarantool(Transport.connect(port, host));
  };

  function Tarantool(conn) {
    this.conn = conn;
  }

  Tarantool.prototype.insert = function(space, tuple, flags, callback) {
    var options, request;
    if (callback === void 0) {
      callback = flags;
      flags = DEFAULT_FLAGS;
    }
    options = compose.int32s(space, flags);
    request = Buffer.concat([options, compose.tuple(tuple)]);
    return this.request(REQUEST_TYPE.insert, request, this.parseBody(callback));
  };

})();


conn.connect()
.then(function(){
  //auth for login, password
  return conn.auth('test', 'test');
}).then(function(){
  // select arguments space_id, index_id, limit, offset, iterator, key
  return conn.select(512, 0, 1, 0, 'eq', [50]);
})
.then(funtion(results){
  doSomeThingWithResults(results);
});
