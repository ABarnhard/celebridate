'use strict';

var User    = require('../models/user'),
    mp      = require('multiparty');

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
  User.findById(req.user._id.toString(), function(err, user){
    res.render('users/profile', {userData:user});
  });
};

exports.addPhotos = function(req, res){
  var form = new mp.Form();
  form.parse(req, function(err, fields, files){
    // console.log('fields', fields);
    // console.log('files', files);
    User.addPhotos(req.user, files, function(){
      res.redirect('/profile');
    });
  });
};

exports.setProfilePhoto = function(req, res){
  req.user.setProfilePhoto(req.body.index, function(){
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
  req.user.updateContact(req.body, function(message){
    if(message){req.flash('error', message);}
    res.redirect('/profile');
  });
};

exports.verify = function(req, res){
  if(!req.user.alias){
    res.render('users/init-info');
  }else{
    res.redirect('/profile');
  }
};

exports.initUpdate = function(req, res){
  req.user.initUpdate(req.body, function(err){
    if(err){
      req.flash('error', err);
      res.redirect('/verify');
    }else{
      res.redirect('/profile');
    }
  });
};

exports.alias = function(req, res){
  User.findOne({alias:req.params.alias}, function(err, client){
    if(client){
      res.render('users/alias', {client:client});
    }else{
      res.redirect('/profile');
    }
  });
};

