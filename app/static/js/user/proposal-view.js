/* global google:true */

(function(){
  'use strict';

  var map;

  $(document).ready(function(){
    var pos = getPosition();
    initMap(pos.lat, pos.lng, 8);
    addMarker(pos.lat, pos.lng, pos.loc);
  });

  function addMarker(lat, lng, loc){
    var latLng = new google.maps.LatLng(lat, lng);
    new google.maps.Marker({map: map, position: latLng, title: loc, animation: google.maps.Animation.DROP});
  }

  function getPosition(){
    var $proposal = $('#proposal'),
        loc       = $proposal.attr('data-loc'),
        lat       = $proposal.attr('data-lat'),
        lng       = $proposal.attr('data-lng'),
        pos       = {loc:loc, lat:parseFloat(lat), lng:parseFloat(lng)};

    return pos;
  }

  function initMap(lat, lng, zoom){
    var mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }
})();
