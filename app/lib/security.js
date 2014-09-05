'use strict';

exports.locals = function(req, res, next){
  res.locals.user  = req.user;
  res.locals.flash = {};

  var keys = Object.keys(req.session.flash || {});
  keys.forEach(function(key){
    res.locals.flash[key] = req.flash(key);
  });

  next();
};

exports.bounce = function(req, res, next){
  if(res.locals.user){
    next();
  }else{
    req.flash('notice', 'Hey there jackwagon, why don\'t you try logging in first?');
    res.redirect('/login');
  }
};

