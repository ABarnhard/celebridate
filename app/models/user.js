'use strict';

var bcrypt = require('bcrypt'),
    Mongo  = require('mongodb'),
    _      = require('underscore-contrib'),
    fs     = require('fs'),
    path   = require('path');

function User(){
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, function(err, obj){
    var user = Object.create(User.prototype);
    user = _.extend(user, obj);
    cb(err, user);
  });
};

User.register = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(user){return cb();}
    o.password = bcrypt.hashSync(o.password, 10);
    User.collection.save(o, cb);
  });
};

User.localAuth = function(email, password, cb){
  // console.log('****localAuth email:', email);
  User.collection.findOne({email:email}, function(err, user){
    // console.log('****localAuth user:', user);
    if(!user){return cb();}
    var isOk = bcrypt.compareSync(password, user.password);
    if(!isOk){return cb();}
    cb(null, user);
  });
};

User.googleAuth = function(accessToken, refreshToken, profile, cb){
  // console.log(accessToken, refreshToken, profile, cb);
  User.collection.findOne({googleId:profile.id}, function(err, user){
    if(user){return cb(err, user);}
    user = {googleId:profile.id, displayName:profile.displayName, type:'google'};
    User.collection.save(user, cb);
  });
};

User.facebookAuth = function(accessToken, refreshToken, profile, cb){
  // console.log(profile);
  User.collection.findOne({facebookId:profile.id}, function(err, user){
    if(user){return cb(err, user);}
    user = {facebookId:profile.id, displayName:profile.displayName, type:'facebook'};
    User.collection.save(user, cb);
  });
};

User.updateProfile = function(user, fields, files, cb){
  // console.log('***Post Body:', fields);
  Object.keys(fields).forEach(function(key){
    fields[key][0] = fields[key][0].trim();
    if(fields[key][0]){
      switch(key){
        case 'visible':
          user.isPublic = (fields[key] === 'public');
          break;
        default:
          user[key] = fields[key][0];
      }
    }
  });
  // console.log('*** Updated User:', user);
  user.moveFiles(files);
  User.collection.save(user, cb);
};

User.prototype.moveFiles = function(files){
  this.photos = this.photos || [];
  var baseDir = __dirname + '/../static',
      relDir  = '/img/' + this._id,
      absDir  = baseDir + relDir,
      exists  = fs.existsSync(absDir);

  if(!exists){
    fs.mkdirSync(absDir);
  }

  var photos = files.photos.map(function(photo, index){
    if(!photo.size){return;}

    var ext      = path.extname(photo.path),
        name     = (index + (this.photos || []).length) + ext,
        absPath  = absDir + '/' + name,
        relPath  = relDir + '/' + name;

    fs.renameSync(photo.path, absPath);
    return relPath;
  });
  photos = _.compact(photos);
  photos = photos.map(function(photo){
    return {url:photo, isPrimary:false};
  });
  this.photos = this.photos.concat(photos);
};

module.exports = User;

