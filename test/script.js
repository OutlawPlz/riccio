( function() {
  var element = document.querySelector( '.album-view' );

  var riccio = new Riccio( element, {
    itemSelector: '.album',
    popSelector: '.track-list'
  } );

  console.log( riccio );
} )();
