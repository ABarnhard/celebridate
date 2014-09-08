'use strict';

var async = require('async'),
    Mongo  = require('mongodb');

function Proposal(p){
  this.senderId   = Mongo.ObjectID(p.senderId);
  this.receiverId = Mongo.ObjectID(p.receiverId);
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

Proposal.countForUser = function(userId, cb){
  Proposal.collection.count({receiverId:userId, isRead:false}, cb);
};

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

Proposal.findAllForUser = function(receiverId, cb){
  Proposal.collection.find({receiverId:receiverId}).sort({date:-1}).toArray(function(err, props){
    async.map(props, iterator, cb);
  });
};

module.exports = Proposal;

function iterator(prop, cb){
  require('./user').findById(prop.senderId, function(err, sender){
    prop.sender = sender;
    cb(null, prop);
  });
}
