'use strict';

var Gift = require('../models/gift');

exports.index = function(req, res){
  Gift.findAll(function(err, gifts){
    res.render('users/gifts', {gifts:gifts});
  });
};
