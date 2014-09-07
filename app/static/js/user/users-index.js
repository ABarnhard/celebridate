(function(){
  'use strict';

  $(document).ready(function(){
    $('#search').click(search);
  });

  function search(e){
    console.log('I Fired');
    var data = $('#searchForm').serialize(),
        type = $('#searchForm').attr('method'),
        url  = $('#searchForm').attr('action'),
        $searchResults = $('#results'),
        $r;
    //$('input, textarea').val('');

    $.ajax({url:url, xhrFields:{withCredentials: true}, type:type, data:data, dataType:'html', success:function(html){
      // console.log('html', html);
      $searchResults.children().remove();
      $r = $(html);
      $r.css('display', 'none');
      $('#results').append($r);
      $r.fadeIn(500);
    }});
    e.preventDefault();
  }
})();

