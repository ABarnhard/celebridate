'use strict';

var config = {};

config.facebook = {
  clientId:'1513404225544139',
  clientSecret: process.env.FB_SECRET_CELEBRIDATE,
  callbackUrl:'http://celebridate.adambarnhard.com/auth/facebook/callback'
};

config.google = {
  clientId:'408000227807-8jc469lkjfhn59tsummlu7tp6muqdu8r.apps.googleusercontent.com',
  clientSecret: process.env.GG_SECRET_CELEBRIDATE,
  callbackUrl:'http://celebridate.adambarnhard.com/auth/google/callback'
};

module.exports = config;
