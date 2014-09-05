'use strict';

var User = require('../models/user'),
    mp     = require('multiparty');

exports.new = function(req, res){
  res.render('users/new');
};

exports.login = function(req, res){
  res.render('users/login');
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.create = function(req, res){
  User.register(req.body, function(err, user){
    if(user){
      res.redirect(307, '/login');
    }else{
      req.flash('notice', 'That Email is already in use in the system');
      res.redirect('/register');
    }
  });
};

exports.profile = function(req, res){
  res.render('users/profile');
};

exports.edit = function(req, res){
  res.render('users/edit');
};

exports.update = function(req, res){
  var form = new mp.Form();
  form.parse(req, function(err, fields, files){
    // console.log('fields', fields);
    // console.log('files', files);
    User.updateProfile(req.user, fields, files, function(){
      res.redirect('/profile');
    });
  });
};

