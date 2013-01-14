/* db connection exports*/
var Db      = require('mongodb').Db
var Server  = require('mongodb').Server
var Connection  = require('mongodb').Connection

DbProvider = function(host, port) {
  this.db = new Db('test', new Server(host, port, { auto_reconnect: true }, {}));
  this.db.open(function(){});
};

exports.DbProvider = DbProvider;
