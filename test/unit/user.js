/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'celebridate-test';

describe('User', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
      expect(u.coordinates).to.have.length(0);
    });
  });

  describe('.findByIdSession', function(){
    it('should return a user object with limited fields', function(done){
      User.findByIdSession('000000000000000000000002', function(err, u){
        expect(Object.keys(u)).to.have.length(7);
        expect(u).to.respondTo('moveFiles');
        expect(u._id.toString()).to.equal('000000000000000000000002');
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should return a full user object from the database', function(done){
      User.findById('000000000000000000000002', function(err, u){
        expect(u).to.respondTo('moveFiles');
        expect(u._id.toString()).to.equal('000000000000000000000002');
        expect(Object.keys(u).length).to.be.at.least(7);
        done();
      });
    });
  });

});

