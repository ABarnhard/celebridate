'use strict';

var async = require('async'),
    Mongo  = require('mongodb');

function Proposal(p){
  this.id         = Mongo.ObjectID;
  this.senderId   = p.senderId;
  this.receiverId = p.receiverId;
  this.loc        = p.loc;
  this.lat        = parseFloat(p.lat);
  this.lng        = parseFloat(p.lng);
  this.activity   = p.activity;
  this.date       = new Date();
  this.message    = p.message;
  this.isRead     = false;
  this.isAccepted = false;
}

Object.defineProperty(Proposal, 'collection', {
  get: function(){return global.mongodb.collection('proposals');}
});

Proposal.read = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Proposal.collection.findAndModify({_id:_id}, [], {$set:{isRead:true}}, function(err, msg){
    iterator(msg, cb);
  });
};

Proposal.send = function(senderId, receiverId, proposal, cb){
  var p = new Proposal(senderId, receiverId, proposal);
  Proposal.collection.save(p, cb);
};

Proposal.unread = function(receiverId, cb){
  Proposal.collection.find({receiverId:receiverId, isRead:false}).count(cb);
};

Proposal.accept = function(receiverId, cb){
  Proposal.collection.find({receiverId:receiverId, isAccepted:false}).count(cb);
};

Proposal.messages = function(receiverId, cb){
  Proposal.collection.find({receiverId:receiverId}).sort({date:-1}).toArray(function(err, msgs){
    async.map(msgs, iterator, cb);
  });
};

module.exports = Proposal;

function iterator(msg, cb){
  require('./user').findById(msg.senderId, function(err, sender){
    msg.sender = sender;
    cb(null, msg);
  });
}
