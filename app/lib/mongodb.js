'use strict';

var MongoClient = require('mongodb').MongoClient;

module.exports = function(name, cb){
  var url = 'mongodb://localhost/' + name;
  MongoClient.connect(url, function(err, db){
    db.collection('users').ensureIndex({'coordinates':'2dsphere'}, function(err, indexName){
      // console.log('********ensureIndexErr', err);
      global.mongodb = db;
      console.log('Express: Database', name);
      if(cb){cb();}
    });
  });
};

