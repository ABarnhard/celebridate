'use strict';

var User     = require('../models/user'),
    Message  = require('../models/message'),
    Proposal = require('../models/proposal'),
    Wink     = require('../models/wink'),
    moment   = require('moment');

exports.sendMessage = function(req, res){
  User.findById(req.params.userId, function(err, receiver){
    res.locals.user.send(receiver, req.body, function(){
      res.redirect('/users/' + receiver.alias);
    });
  });
};

exports.index = function(req, res){
  res.locals.user.messages(function(err, msgs){
    res.locals.user.proposals(function(err, props){
      res.locals.user.winks(function(err, winks){
        res.render('users/messages', {msgs:msgs, props:props, winks:winks, moment:moment});
      });
    });
  });
};

exports.message = function(req, res){
  Message.read(req.params.msgId, function(err, msg){
    res.render('users/message', {msg:msg, moment:moment});
  });
};

exports.sendProposal = function(req, res){
  Proposal.send(req.body.senderId, req.body.receiverId, req.body, function(){
    User.findById(req.body.receiverId, function(err, user){
      res.redirect('/users/' + user.alias);
    });
  });
};

exports.proposalMessages = function(req, res){
  res.locals.user.messages(function(err, props){
    res.render('users/messages', {props:props});
  });
};

exports.proposalMessage = function(req, res){
  Proposal.read(req.params.msgId, function(err, prop){
    res.render('users/proposal-view', {prop:prop});
  });
};

exports.newProposal = function(req, res){
  res.render('users/proposal', {receiverId:req.params.receiverId});
};

exports.sendWink = function(req, res){
  Wink.send(req.body.senderId, req.body.receiverId, req.body, function(){
    User.findById(req.body.receiverId, function(err, user){
      res.redirect('/users/' + user.alias);
    });
  });
};

