'use strict';

var config = {};

config.facebook = {
  clientId:'1513404225544139',
  clientSecret: process.env.FB_SECRET_CELEBRIDATE,
  callbackUrl:'http://celebridate-vm.com:3000/auth/facebook/callback'
};

config.google = {
  clientId:'684183651325-0pc397hugr7iir31nkh6qj84p3obtj3u.apps.googleusercontent.com',
  clientSecret: process.env.GG_SECRET_CELEBRIDATE,
  callbackUrl:'http://celebridate-vm.com:3000/auth/google/callback'
};

module.exports = config;
