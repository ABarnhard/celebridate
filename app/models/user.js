'use strict';

var bcrypt   = require('bcrypt'),
    Mongo    = require('mongodb'),
    _        = require('underscore-contrib'),
    Message  = require('./message'),
    Proposal = require('./proposal'),
    Wink     = require('./wink'),
    fs       = require('fs'),
    path     = require('path');

function User(){
  this.coordinates = [];
  this.about = {};
  this.profilePhoto = '/img/placeholder.gif';
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findByIdSession = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, {
    fields:{
      alias:1,
      orientation:1,
      age:1,
      sex:1,
      email:1,
      coordinates:1,
      type:1,
      location:1
    }
  }, function(err, obj){
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
    User.collection.update({_id:self._id}, {
      $set:{
        alias:data.alias,
        email:data.email,
        location:data.location,
        coordinates:data.coordinates,
        phone:data.phone,
        sex:data.sex,
        orientation:data.orientation,
        age: parseInt(data.age),
        address:{zip:data.zip}
      }
    }, cb);
  });
};

User.prototype.updateAbout = function(data, cb){
  Object.keys(data).forEach(function(key){
    data[key] = data[key].trim();
  });
  User.collection.update({_id:this._id}, {$set:{about:data}}, cb);
};

User.prototype.updateDetails = function(data, cb){
  var orientation = data.orientation === '-' ? this.orientation : data.orientation;
  delete data.orientation;
  User.collection.update({_id:this._id}, {$set:{orientation:orientation, details:data}}, cb);
};

User.prototype.setProfilePhoto = function(index, cb){
  User.collection.findOne({_id:this._id}, {fields:{photos:1}}, function(err, data){
    var profile = data.photos[index];
    User.collection.update({_id:data._id}, {$set:{profilePhoto:profile}}, cb);
  });
};

User.prototype.updateContact = function(data, cb){
  var self   = this,
      message;
  User.collection.findOne({alias:data.alias}, function(err, obj){
    if(obj && obj.alias !== self.alias){
      message = 'Desired alias in use, didn\'t update';
      data.alias = self.alias;
    }
    data.coordinates.forEach(function(c, i){
      data.coordinates[i] = parseFloat(c);
    });
    User.collection.update({_id:self._id}, {
      $set:{
        coordinates:data.coordinates,
        alias:data.alias,
        name:data.name,
        email:data.email,
        location:data.location,
        phone:data.phone,
        address:data.address
      }
    }, function(err, obj){
      cb(message);
    });
  });
};

User.prototype.unread = function(cb){
  Message.unread(this._id, cb);
};

User.prototype.save = function(o, cb){
  var properties = Object.keys(o),
      self       = this;
  properties.forEach(function(property){
    self[property] = o[property];
  });
  delete this.unread;
  User.collection.save(self, cb);
};

User.prototype.messages = function(cb){
  Message.messages(this._id, cb);
};

User.prototype.proposals = function(cb){
  Proposal.proposals(this._id, cb);
};

User.prototype.winks = function(cb){
  Wink.findAllByOwner(this._id, cb);
};

User.prototype.send = function(receiver, obj, cb){
  Message.send(this._id, receiver._id, obj. subject, obj.message, cb);
};

User.findOne = function(filter, cb){
  User.collection.findOne(filter, cb);
};

User.prototype.find = function(data, cb){
  data = data || {};
  var filter,
      sort   = {};
  if(data.gentation){
    var options = data.gentation.split('-');
    filter = makeFilter(options[0], options[1]);
  }else{
    filter = makeFilter(this.sex, this.orientation);
  }
  if(data.age){
    var range = data.age.split('-').map(function(s){return parseInt(s);});
    filter.age = {$gte:range[0], $lt:range[1]};
  }
  filter._id = {$ne:this._id};
  console.log('*******FILTER', filter);
  User.collection.find(filter).sort(sort).toArray(function(err, objs){
    console.log(objs);
    cb(err, objs);
  });
};

module.exports = User;

// Helper Functions
function makeFilter(sex, orientation){
  var filter = {};
  switch(sex){
    case 'M':
      switch(orientation){
        case 'S':
          filter.$and = [
            {sex:'F'},
            {orientation:{$ne:'G'}}
          ];
          break;
        case 'G':
          filter.$and = [
            {sex:'M'},
            {orientation:{$ne:'S'}}
          ];
          break;
        case 'B':
          filter.$or = [
            {
              $and:[
                {sex:'M'},
                {orientation:{$ne:'S'}}
              ]
            },
            {
              $and:[
                {sex:'F'},
                {orientation:{$ne:'G'}}
              ]
            }
          ];
          break;
      }
      break;
    case 'F':
      switch(orientation){
        case 'S':
          filter.$and = [
            {sex:'M'},
            {orientation:{$ne:'G'}}
          ];
          break;
        case 'G':
          filter.$and = [
            {sex:'F'},
            {orientation:{$ne:'S'}}
          ];
          break;
        case 'B':
          filter.$or = [
            {
              $and:[
                {sex:'F'},
                {orientation:{$ne:'S'}}
              ]
            },
            {
              $and:[
                {sex:'M'},
                {orientation:{$ne:'G'}}
              ]
            }
          ];
          break;
      }
      break;
  }
  return filter;
}
