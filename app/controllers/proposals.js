'use strict';

var User = require('../models/user'),
    Proposal = require('../models/proposal');

exports.send = function(req, res){
  User.findById(req.params.userId, function(err, receiver){
    res.locals.user.send(receiver, req.body, function(){
      res.redirect('/users/' + receiver.email);
    });
  });
};

exports.messages = function(req, res){
  res.locals.user.messages(function(err, props){
    res.render('users/messages', {props:props});
  });
};

exports.message = function(req, res){
  Proposal.read(req.params.msgId, function(err, prop){
    res.render('users/proposal-view', {prop:prop});
  });
};

exports.proposal = function(req, res){
  res.render('users/proposal');
};

exports.view = function(req, res){
  res.render('users/proposal-view');
};
