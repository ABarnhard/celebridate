/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'celebridate-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@mailinator.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /register', function(){
    it('should show the register page', function(done){
      request(app)
      .get('/register')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Register');
        done();
      });
    });
  });

  describe('post /register', function(){
    it('should redirect and post to login', function(done){
      request(app)
      .post('/register')
      .send('email=john%40gmail.com&password=1234')
      .end(function(err, res){
        expect(res.status).to.equal(307);
        expect(res.headers.location).to.equal('/login');
        done();
      });
    });
    it('should redirect to the register page(duplicate email in system)', function(done){
      request(app)
      .post('/register')
      .send('email=bob%40mailinator.com&password=1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/register');
        done();
      });
    });
  });

  describe('get /login', function(){
    it('should return the login page', function(done){
      request(app)
      .get('/login')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Login');
        done();
      });
    });
  });

  describe('get /auth/google', function(){
    it('should initiate oauth with google service', function(done){
      request(app)
      .get('/auth/google')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location.indexOf('accounts.google.com')).to.not.equal(-1);
        done();
      });
    });
  });

  describe('get /auth/google/callback', function(){
    it('should trigger passport function', function(done){
      request(app)
      .get('/auth/google/callback')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location.indexOf('accounts.google.com')).to.not.equal(-1);
        done();
      });
    });
  });

  describe('get /auth/facebook', function(){
    it('should initiate oauth with facebook service', function(done){
      request(app)
      .get('/auth/facebook')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location.indexOf('facebook')).to.not.equal(-1);
        done();
      });
    });
  });

  describe('get /auth/facebook/callback', function(){
    it('should initiate oauth with facebook service', function(done){
      request(app)
      .get('/auth/facebook/callback')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location.indexOf('facebook')).to.not.equal(-1);
        done();
      });
    });
  });

  describe('post /login', function(){
    it('should redirect to the home page', function(done){
      request(app)
      .post('/login')
      .send('email=bob%40mailinator.com&password=1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/verify');
        done();
      });
    });
    it('should redirect to login page (incorrect credentials)', function(done){
      request(app)
      .post('/login')
      .send('email=bob%40aol.com&password=12345')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/login');
        done();
      });
    });
  });

  describe('bounce (redirect  /login)', function(){
    it('should redirect to the login page if cookie isn\'t set', function(done){
      request(app)
      .post('/logout')
      .send('_method=delete')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/login');
        done();
      });
    });
  });

  describe('delete /logout', function(){
    it('should redirect to the home page', function(done){
      request(app)
      .post('/logout')
      .set('cookie', cookie)
      .send('_method=delete')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/');
        done();
      });
    });
  });

  describe('get /profile', function(){
    it('should display the user\'s profile page', function(done){
      request(app)
      .get('/profile')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Profile');
        expect(res.text).to.include('About Me');
        done();
      });
    });
  });

  describe('get /messages', function(){
    it('should return the messages page', function(done){
      request(app)
      .get('/messages')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Message');
        done();
      });
    });
  });

  describe('put /profile/photos/primary', function(){
    it('should redirect to profile after setting primary profile photo', function(done){
      request(app)
      .post('/profile/photos/primary')
      .set('cookie', cookie)
      .send('_method=put&index=1')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('put /profile/about', function(){
    it('should redirect to profile after updating about info', function(done){
      request(app)
      .post('/profile/about')
      .set('cookie', cookie)
      .send('_method=put&summary=Test')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('put /profile/about', function(){
    it('should redirect to profile after updating about info', function(done){
      request(app)
      .post('/profile/about')
      .set('cookie', cookie)
      .send('_method=put&summary=Test')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('put /profile/details', function(){
    it('should redirect to profile after updating details info', function(done){
      request(app)
      .post('/profile/details')
      .set('cookie', cookie)
      .send('_method=put&bodyType=thin')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('get /messages/messageId', function(){
    it('should return a message for the user', function(done){
      request(app)
      .get('/messages/c00000000000000000000001')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('message');
        done();
      });
    });
  });

  describe('get /messages/messageId', function(){
    it('should return a message for the user', function(done){
      request(app)
      .get('/messages/c00000000000000000000001')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('message');
        done();
      });
    });
  });

});

