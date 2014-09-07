/* jshint expr:true */
/* global describe, it, before, beforeEach, after */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    Mongo     = require('mongodb'),
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
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
      expect(u.coordinates).to.have.length(0);
    });
  });

  describe('.findByIdSession', function(){
    it('should return a user object with limited fields', function(done){
      User.findByIdSession('000000000000000000000002', function(err, u){
        expect(Object.keys(u)).to.have.length(8);
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
        expect(Object.keys(u).length).to.be.at.least(8);
        done();
      });
    });
  });

  describe('.googleAuth', function(){
    it('should create a new user in DB', function(done){
      var obj = {id:'0009090'};
      User.googleAuth({}, {}, obj, function(err, u){
        expect(u._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

  describe('.facebookAuth', function(){
    it('should create a new user in DB', function(done){
      var obj = {id:'9090909'};
      User.facebookAuth({}, {}, obj, function(err, u){
        expect(u._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

  describe('.addPhotos', function(){
    it('should move & rename files uploaded by user', function(done){
      var test1 = __dirname + '/../img/test1.jpg',
          test2 = __dirname + '/../img/test2.jpg',
          files = {photos: [{size:'5kb', path:test1}, {size:'5kb', path:test2}]};
      // console.log(test1, test2);
      User.findById('000000000000000000000002', function(err, u){
        User.addPhotos(u, files, function(){
          User.findById('000000000000000000000002', function(err2, u2){
            expect(u2.photos).to.have.length(2);
            done();
          });
        });
      });
    });
  });

  describe('#initUpdate', function(){
    it('should add required initial info to a new user & update record in database', function(done){
      User.findById('000000000000000000000005', function(err, u){
        var data = {alias:'SweetJonney', email:'sw@mailinator.com', location:'Nashville, TN 37201, USA', coordinates:['0', '0'], phone:'555-555-5555', zip:'99999'};
        u.initUpdate(data, function(){
          User.findById('000000000000000000000005', function(err2, u2){
            expect(u2.alias).to.equal('SweetJonney');
            expect(u2.coordinates[0]).to.equal(0);
            done();
          });
        });
      });
    });
  });

  describe('#updateAbout', function(){
    it('should update the user\'s about informaion', function(done){
      User.findById('000000000000000000000005', function(err, u){
        var data = {summary:'I\'m a lonely celebrity', favoriteStuff:'Being famous'};
        u.updateAbout(data, function(){
          User.findById('000000000000000000000005', function(err2, u2){
            expect(u2.about.summary).to.equal('I\'m a lonely celebrity');
            done();
          });
        });
      });
    });
  });

  describe('#updateDetails', function(){
    it('should update the user\'s detail informaion', function(done){
      User.findById('000000000000000000000005', function(err, u){
        var data = {drugs:'Always', diet:'cocain', bodyType:'thin'};
        u.updateDetails(data, function(){
          User.findById('000000000000000000000005', function(err2, u2){
            expect(u2.details.diet).to.equal('cocain');
            done();
          });
        });
      });
    });
  });

  describe('#setProfilePhoto', function(){
    it('should update the profilePhoto field with the selected image', function(done){
      User.findById('000000000000000000000003', function(err, u){
        u.setProfilePhoto('2', function(){
          User.findById('000000000000000000000003', function(err2, u2){
            expect(u2.profilePhoto).to.equal('photo3.jpg');
            done();
          });
        });
      });
    });
  });

});

