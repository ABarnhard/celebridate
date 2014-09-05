'use strict';

module.exports = function(user, cb){
  // console.log('******Serialize', user);
  cb(null, {userId:user._id});
};

