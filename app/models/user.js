'use strict';

var bcrypt = require('bcrypt'),
    Mongo  = require('mongodb'),
    _      = require('underscore-contrib'),
    fs     = require('fs'),
    path   = require('path');

function User(){
  this.coordinates = [];
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findByIdSession = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, {fields:{alias:1, email:1, coordinates:1, type:1, location:1, zip:1}}, function(err, obj){
    var user = Object.create(User.prototype);
    user = _.extend(user, obj);
    cb(err, user);
  });
};

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
    o.type = 'local';
    user = new User();
    user = _.extend(user, o);
    User.collection.save(user, cb);
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
    user = new User();
    user = _.extend(user, {googleId:profile.id, type:'google'});
    User.collection.save(user, cb);
  });
};

User.facebookAuth = function(accessToken, refreshToken, profile, cb){
  // console.log(profile);
  User.collection.findOne({facebookId:profile.id}, function(err, user){
    if(user){return cb(err, user);}
    user = new User();
    user = _.extend(user, {facebookId:profile.id, type:'facebook'});
    User.collection.save(user, cb);
  });
};

User.addPhotos = function(user, files, cb){
  user.moveFiles(files);
  User.collection.save(user, cb);
};

User.prototype.moveFiles = function(files){
  this.photos = this.photos || [];
  var baseDir = __dirname + '/../static',
      relDir  = '/img/user_pics/' + this._id,
      absDir  = baseDir + relDir,
      exists  = fs.existsSync(absDir),
      self    = this;

  if(!exists){
    fs.mkdirSync(absDir);
  }

  var photos = files.photos.map(function(photo, index){
    if(!photo.size){return;}

    var ext      = path.extname(photo.path),
        name     = (index + (self.photos || []).length) + ext,
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

User.prototype.initUpdate = function(data, cb){
  // console.log('************DATA', data);
  var self = this;
  User.collection.findOne({alias:data.alias}, function(err1, obj1){
    if(obj1){return cb('Please choose a different alias, that one is already in use');}
    data.coordinates.forEach(function(c, i){
      data.coordinates[i] = parseFloat(c);
    });
    User.collection.update({_id:self._id}, {$set:{alias:data.alias, email:data.email, location:data.location, coordinates:data.coordinates, phone:data.phone, zip:data.zip}}, cb);
  });
};

User.prototype.updateAbout = function(data, cb){
  Object.keys(data).forEach(function(key){
    data[key] = data[key].trim();
  });
  User.collection.update({_id:this._id}, {$set:{about:data}}, cb);
};

User.prototype.updateDetails = function(data, cb){
  User.collection.update({_id:this._id}, {$set:{details:data}}, cb);
};

User.prototype.setProfilePhoto = function(index, cb){
  User.collection.findOne({_id:this._id}, {fields:{photos:1}}, function(err, data){
    var i = data.photos.map(function(x){return x.isPrimary;}).indexOf(true);
    if(i !== -1){data.photos[i].isPrimary = false;}
    data.photos[index].isPrimary = true;
    User.collection.update({_id:data._id}, {$set:{photos:data.photos}}, cb);
  });
};
// NEED TO TOUCH BASE BEFORE FINISHING
/*
User.prototype.updateContact = function(data, cb){
};
*/

module.exports = User;

