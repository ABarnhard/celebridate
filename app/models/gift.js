'use strict';

var Mongo  = require('mongodb');

function Gift(){
}

Object.defineProperty(Gift, 'collection', {
  get: function(){return global.mongodb.collection('gifts');}
});

Gift.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Gift.collection.findOne({_id:_id}, cb);
};

Gift.findAll = function(cb){
  Gift.collection.find().toArray(cb);
};



module.exports = Gift;

