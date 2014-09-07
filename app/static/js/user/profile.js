/* jshint unused:false, camelcase:false */
/* global google */

(function(){
  'use strict';

  $(document).ready(function(){
    console.log('****I Happened');
    $('#updateContact').click(geocodeAndSubmit);
  });

  function geocodeAndSubmit(e){
    var geocoder = new google.maps.Geocoder(),
        zip = $('#zip').val();
    geocoder.geocode({address:zip}, function(results, status){
      var name = results[0].formatted_address,
          lat  = results[0].geometry.location.lat(),
          lng  = results[0].geometry.location.lng();
      // debugger;
      $('input[name=location]').val(name);
      $('input[data-name=lat]').val(lat);
      $('input[data-name=lng]').val(lng);
      $('#contact_form').submit();
    });
    e.preventDefault();
  }

})();

