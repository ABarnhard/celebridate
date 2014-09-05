'use strict';

var User = require('../../models/user');

module.exports = function(obj, cb){
  // console.log('******Deserialize', obj);
  User.findById(obj.userId, cb);
};

