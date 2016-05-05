( function() {
  var element = document.querySelector( '.album-view' );

  var riccio = new Riccio( element, {
    item_selector: '.album',
    pop_selector: '.track-list'
  } );

  console.log( riccio );
} )();
