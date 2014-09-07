/* jshint expr:true */
/* global describe, it, before, beforeEach, after */

'use strict';

var expect    = require('chai').expect,
    Wink      = require('../../app/models/wink'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'celebridate-test';

describe('Wink', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      cp.execFile(__dirname + '/../scripts/make-img.sh', [], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
        done();
      });
    });
  });

  after(function(done){
    cp.execFile(__dirname + '/../scripts/make-img.sh', [], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new Wink object', function(){
      var w = new Wink();
      expect(w).to.be.instanceof(Wink);
      expect(w.count).to.equal(1);
      expect(w.isRead).to.be.false;
    });
  });


  describe('.findAllByOwner', function(){
    it('should return all the winks of ownerId from the database', function(done){
      Wink.findAllByOwner('000000000000000000000002', function(err, w){
        expect(w._id.toString()).to.equal('000000000000000000000002');
        done();
      });
    });
  });



});

