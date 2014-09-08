'use strict';

var Message  = require('../models/message'),
    Proposal = require('../models/proposal'),
    Wink     = require('../models/wink');

exports.locals = function(req, res, next){
  res.locals.user  = req.user;
  res.locals.flash = {};

  var keys = Object.keys(req.session.flash || {});
  keys.forEach(function(key){
    res.locals.flash[key] = req.flash(key);
  });
  var user = req.user || {};
  Message.countForUser(user._id, function(err1, mCount){
    Proposal.countForUser(user._id, function(err2, pCount){
      Wink.countForUser(user._id, function(err3, wCount){
        res.locals.mCount = mCount + pCount + wCount;
        next();
      });
    });
  });
};

exports.bounce = function(req, res, next){
  if(res.locals.user){
    next();
  }else{
    req.flash('notice', 'Hey there jackwagon, why don\'t you try logging in first?');
    res.redirect('/login');
  }
};

