( function( Riccio ) {

  'use strict';

  var element = document.querySelector( '.album-view' );

  var riccio = new Riccio( element, {
    itemSelector: '.album',
    popSelector: '.track-list',
    mediaQueries: [
      '(max-width: 560px)',
      '(min-width: 561px) and (max-width: 850px)',
      '(min-width: 851px)'
    ]
  } );

  console.log( riccio );
} ( window.Riccio ) );
