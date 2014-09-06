'use strict';

var morgan         = require('morgan'),
    bodyParser     = require('body-parser'),
    methodOverride = require('express-method-override'),
    less           = require('less-middleware'),
    session        = require('express-session'),
    RedisStore     = require('connect-redis')(session),
    security       = require('../lib/security'),
    passport       = require('passport'),
    flash          = require('connect-flash'),
    passportConfig = require('../lib/passport/config'),
    debug          = require('../lib/debug'),
    home           = require('../controllers/home'),
    users          = require('../controllers/users');

module.exports = function(app, express){
  app.use(morgan('dev'));
  app.use(less(__dirname + '/../static'));
  app.use(express.static(__dirname + '/../static'));
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(methodOverride());
  app.use(session({store:new RedisStore(), secret:'WickedUnbreakableHash', resave:true, saveUninitialized:true, cookie:{maxAge:null}}));
  app.use(flash());
  passportConfig(passport, app);

  app.use(security.locals);
  app.use(debug.info);

  app.get('/', home.index);
  app.get('/register', users.new);
  app.post('/register', users.create);
  app.get('/login', users.login);
  app.post('/login',                 passport.authenticate('local', {successRedirect:'/verify', failureRedirect:'/login', failureFlash:'Login failed'}));
  app.get('/auth/google',            passport.authenticate('google',   {scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']}));
  app.get('/auth/google/callback',   passport.authenticate('google',   {successRedirect:'/verify', failureRedirect:'/login', failureFlash:'Google Login failed'}));
  app.get('/auth/facebook',          passport.authenticate('facebook'));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {successRedirect:'/verify', failureRedirect:'/login', failureFlash:'Facebook Login failed'}));

  app.use(security.bounce);
  app.delete('/logout', users.logout);
  app.get('/verify', users.verify);
  app.get('/profile', users.profile);
  app.put('/profile/init', users.initUpdate);
  app.post('/profile/photos', users.addPhotos);
  app.put('/profile/photos/primary', users.setProfilePhoto);
  app.put('/profile/about', users.about);
  app.put('/profile/details', users.details);
  // app.put('/profile/contact', users.contact);
  app.put('/profile/about', users.details);
  app.post('/message/:userId', users.send);
  app.get('/messages', users.messages);
  app.get('/messages/:msgId', users.message);
  app.get('/users/alias', users.alias);

  console.log('Express: Routes Loaded');
};

