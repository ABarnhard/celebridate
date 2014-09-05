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

exports.addPhoto = function(req, res){
  var form = new mp.Form();
  form.parse(req, function(err, fields, files){
    // console.log('fields', fields);
    // console.log('files', files);
    User.addPhotos(req.user, fields, files, function(){
      res.redirect('/profile');
    });
  });
};

exports.setProfilePhoto = function(req, res){
  req.user.setProfilePhoto(req.body, function(){
    res.redirect('/profile');
  });
};

exports.about = function(req, res){
  req.user.updateAbout(req.body, function(){
    res.redirect('/profile');
  });
};

exports.details = function(req, res){
  req.user.updateDetails(req.body, function(){
    res.redirect('/profile');
  });
};

exports.contact = function(req, res){
  req.user.updateContact(req.body, function(){
    res.redirect('/profile');
  });
};

