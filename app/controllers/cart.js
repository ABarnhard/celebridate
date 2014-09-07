'use strict';

var Gift = require('../models/gift');
   // config  = require('../../config');

exports.add = function(req, res){
  Gift.findById(req.body.giftId, function(err, gift){
    req.session.cart = req.session.cart || [];
    req.session.cart.push(gift);
    req.session.save(function(){
      res.redirect('/cart');
    });
  });
};

exports.index = function(req, res){
  var gifts    = {},
      subtotal = 0,
      tax      = 0,
      total    = 0;

  (req.session.cart || []).forEach(function(g){
    subtotal += g.price;
    var id = g._id.toString();
    gifts[id] = gifts[id] || {g:g, c:0};
    gifts[id].c++;
  });

  tax = subtotal * 0.075;
  total = subtotal + tax;

  req.session.totalCents = Math.round(total * 100);
  req.session.save(function(){
    res.render('users/cart', {ids:Object.keys(gifts), gifts:gifts, subtotal:subtotal, tax:tax, total:total});
    //res.render('users/cart', {key:config.stripe.publishKey, ids:Object.keys(gifts), gifts:gifts, subtotal:subtotal, tax:tax, total:total});
  });
};

exports.destroy = function(req, res){
  req.session.cart = [];
  req.session.save(function(){
    res.redirect('/cart');
  });
};

