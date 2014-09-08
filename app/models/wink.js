'use strict';
var async = require('async'),
    Mongo = require('mongodb');

function Wink(senderId, receiverId){
  this.senderId   = senderId;
  this.receiverId = receiverId;
  this.count      = 1;
  this.isRead     = false;
}

Object.defineProperty(Wink, 'collection', {
  get: function(){return global.mongodb.collection('winks');}
});

Wink.send = function(senderId, receiverId, cb){
  receiverId = Mongo.ObjectID(receiverId);
  Wink.collection.findOne(senderId, receiverId, function(err, wink){
    if(wink){
      Wink.collection.update({_id:wink._id}, {$set:{isRead:false}, $inc:{count:1}}, cb);
    }else{
      var w = new Wink(senderId, receiverId);
      Wink.collection.save(w, cb);
    }
  });
};

Wink.findAllForUser = function(receiverId, cb){
  Wink.collection.find({receiverId:receiverId, isRead:false}).toArray(function(err, winks){
    async.each(winks, iterator2, function(){
      async.map(winks, iterator, cb);
    });
  });
};

module.exports = Wink;

function iterator(wink, cb){
  require('./user').findById(wink.senderId, function(err, sender){
    wink.sender = sender;
    cb(null, wink);
  });
}
function iterator2(wink, cb){
  Wink.collection.update({_id:wink._id}, {$set:{isRead:true}}, function(){
    cb(null);
  });
}
