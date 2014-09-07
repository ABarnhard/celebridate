/* jshint unused:false, camelcase:false */
/* global google */

(function(){
  'use strict';

  $(document).ready(function(){
    $('button[type=submit]').click(geocodeAndSubmit);
  });

  function geocodeAndSubmit(e){
    var geocoder = new google.maps.Geocoder(),
        loc = $('input[name=loc]').val();
    geocoder.geocode({address:loc}, function(results, status){
      console.log('results', results);
      var name = results[0].formatted_address,
          lat  = results[0].geometry.location.lat(),
          lng  = results[0].geometry.location.lng();
      $('input[name=loc]').val(name);
      $('input[data-name=lat]').val(lat);
      $('input[data-name=lng]').val(lng);
      $('form').submit();
    });
    e.preventDefault();
  }

})();

