/* jshint unused:false, camelcase:false */
/* global google */

(function(){
  'use strict';

  $(document).ready(function(){
    $('button[type=submit]').click(geocodeAndSubmit);
  });

  function geocodeAndSubmit(e){
    var geocoder = new google.maps.Geocoder(),
        loc = $('#loc').val();
    console.log(loc);
    geocoder.geocode({address:loc}, function(results, status){
      console.log('results', results);
      var loc  = results[0].formatted_address,
          lat  = results[0].geometry.location.lat(),
          lng  = results[0].geometry.location.lng();
      $('#loc').val(name);
      $('input[data-name=lat]').val(lat);
      $('input[data-name=lng]').val(lng);
      $('form').submit();
    });
    e.preventDefault();
  }

})();

