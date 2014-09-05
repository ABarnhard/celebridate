/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'template-test';

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
      .send('email=bob@aol.com')
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
      .send('email=bob%40aol.com&password=1234')
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

  describe('post /login', function(){
    it('should redirect to the home page', function(done){
      request(app)
      .post('/login')
      .send('email=bob%40aol.com&password=1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
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
  describe('get /messages/messageId', function(){
    it('should return a message for the user', function(done){
      request(app)
      .get('/messages/c00000000000000000000001')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('test message');
        done();
      });
    });
  });
});

