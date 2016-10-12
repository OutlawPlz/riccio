/*!
 * Riccio - v1.0.6
 * Adaptive grid view with expanding info box.
 */

 /*
 TODO - Implements UMD.
 TODO - Add appendItems and prependItems methods.
 TODO - Init with HTML.
 TODO - Remove itemStore and popStore.
 TODO - Implements destroy method.
  */

( function() {

  'use strict';

  var console = window.console,
      mediaQueries = [];


  // Constructor
  // ---------------------------------------------------------------------------

  /**
   * Instantiate a new Riccio object.
   *
   * @param  {Node} element
   *         The node on which Riccio will act.
   * @param  {Object} options
   *         An object containing Riccio options.
   * @return {object|undefined}
   *         A new Riccio object
   */
  function Riccio( element, options ) {

    if ( element.nodeType !== Node.ELEMENT_NODE ) {
      if ( console ) {
        console.error( 'Riccio: the given element is not valid.', element );
      }
      return;
    }
    this.element = element;

    // Default options.
    var defaults = {
      itemSelector: '',
      popSelector: '',
      perRow: true,
      mediaQueries: true
    };

    if ( options && typeof options === 'object' ) {
      this.options = extendDefaults( defaults, options );
    }

    if ( this.options.perRow && typeof this.options.perRow === 'boolean' ) {
      this.options.perRow = getPerRow( this.element );
    }

    var itemStore = this.element.querySelectorAll( this.options.itemSelector ),
        popStore = this.element.querySelectorAll( this.options.popSelector );

    if ( itemStore.length !== popStore.length ) {
      if ( console ) {
        console.error( 'Riccio: items number and pops number doesn\'t match.' );
      }
      return;
    }

    this.itemStore = itemStore;
    this.popStore = popStore;

    this.init();

    handleClick( this );

    if ( !mediaQueries.length ) {
      this.options.mediaQueries = getMediaQueries( this.options.mediaQueries );
    }
    else {
      this.options.mediaQueries = mediaQueries;
    }

    handleMediaQueries( this );
  }


  // Public methods
  // ---------------------------------------------------------------------------

  /**
   * Initialize a Riccio object. This function is called when a new Riccio
   * object is instantiate, or when a breakpoint is triggered.
   *
   * @return {undefined}
   */
  Riccio.prototype.init = function() {

    // Add Riccio CSS class.
    this.element.classList.add( 'riccio' );

    var fragment = document.createDocumentFragment(),
        activePop = this.element.querySelector( '.riccio__pop--active' ),
        prevRow = this.element.querySelector( '.riccio__row-pop--active' );

    fragment = this.setRows( fragment );
    fragment = this.setItems( fragment );

    this.element.appendChild( fragment );

    if ( activePop ) {
      toggleRow( activePop.parentElement, prevRow );
    }
  };

  /**
   * Return the number of rows you have and the number of rows you need to wrap
   * the items.
   *
   * As other functions it counts an item row and the relative pop row as a
   * single element. So if you need two rows, it means that you need two item
   * rows and two pop rows.
   *
   * @return {Object}
   *         An object containing the number of rows you have and the number of
   *         rows you need, keyed by "having" and "needed".
   */
  Riccio.prototype.needs = function() {

    var itmsIndex = this.element.querySelectorAll( this.options.itemSelector ).length;

    return {
      having: this.element.querySelectorAll( '.riccio__row-item' ).length,
      needed: Math.ceil( itmsIndex / this.options.perRow )
    };
  };

  /**
   * Takes items and pops and appends them to the given fragment.
   * The function doesn't check if there are enough rows, it's up to you provide
   * the correct number of rows.
   *
   * @param  {Node} fragment
   *         The element to which append items and pops.
   * @return {Node}
   *         The given element with items and pops appended.
   */
  Riccio.prototype.setItems = function( fragment ) {

    var itemRows = fragment.querySelectorAll( '.riccio__row-item' ),
        popRows = fragment.querySelectorAll( '.riccio__row-pop' ),
        itmIndex = this.itemStore.length,
        i = 0, // Items & Pops
        r = 0; // Rows

    while ( i < itmIndex ) {
      this.itemStore[ i ].setAttribute( 'data-riccio', i );
      this.itemStore[ i ].classList.add( 'riccio__item' );
      this.popStore[ i ].classList.add( 'riccio__pop' );

      itemRows[ r ].appendChild( this.itemStore[ i ] );
      popRows[ r ].appendChild( this.popStore[ i ] );

      i++;

      var rowFull = i % this.options.perRow;
      if ( !rowFull ) {
        r++;
      }
    }

    return fragment;
  };

  /**
   * Return the given fragment with the rigth number of pops and items rows.
   *
   * @param  {Node} fragment
   *         The element to which append rows.
   * @return {Node}
   *         The given element with rows appended.
   */
  Riccio.prototype.setRows = function( fragment ) {

    var info = this.needs(),
        difference = info.needed - info.having;

    if ( info.having ) {
      var rows = this.element.querySelectorAll( '.riccio__row-item, .riccio__row-pop' ),
          rwsIndex = rows.length;

      for ( var i = 0; i < rwsIndex; i++ ) {
        fragment.appendChild( rows[ i ] );
      }
    }

    if ( difference ) {
      if ( sign( difference ) === -1 ) {
        difference *= -1; // Be positive.
        fragment = removeRows( fragment, difference );
      }
      else {
        fragment = addRows( fragment, difference );
      }
    }

    return fragment;
  };

  /**
   * Open or close the element corresponding to the given index.
   *
   * @param {String} index
   *        The index of the popStore corresponding to the element to open.
   * @return {undefined}
   */
  Riccio.prototype.toggle = function( index ) {

    var prevPop = this.element.querySelector( '.riccio__pop--active' ),
        prevItem = this.element.querySelector( '.riccio__item--active' ),
        prevRow = this.element.querySelector( '.riccio__row-pop--active' );

    toggleItem( this.itemStore[ index ], prevItem );
    togglePop( this.popStore[ index ], prevPop );
    toggleRow( this.popStore[ index ].parentElement, prevRow );
  };


  // Private methods
  // ---------------------------------------------------------------------------

  /**
   * Take an object, loop through its properties, and if it isn't an internal
   * property, assigns it to the source object.
   *
   * @param  {Object} source
   *         An object representing the default options.
   * @param  {object} properties
   *         An object representing the user options.
   * @return {object}
   *         An updated object with merged options.
   */
  function extendDefaults( source, properties ) {
    var property;

    for ( property in properties ) {
      if ( source.hasOwnProperty( property ) ) {
        source[ property ] = properties[ property ];
      }
    }

    return source;
  }

  /**
   * Read the perRow option from CSS. If the option is not found return a
   * default value. The default value is 1.
   * @param  {Element} elem
   *         The element on which look for perRow option.
   * @return {Number}
   *         The number of elements to print in a row.
   */
  function getPerRow( elem ) {
    var computedStyle = getComputedStyle( elem, ':before' ),
        perRow = computedStyle.getPropertyValue( 'content' );

    if ( perRow === 'none' ) {
      return 1;
    }
    else {
      return parseInt( perRow.slice( 1, -1 ), 10 );
    }

  }

  /**
   * Return the given element with the given number of rows added.
   *
   * As other functions it counts an item row and a pop row as a single element.
   * So if you add two rows, it means that you are adding two item rows and two
   * pop rows.
   *
   * @param  {Node} frag
   *         The element to which add the rows.
   * @param  {Number} num
   *         The number of rows to add.
   * @return {Node}
   *         The given element with the given number of rows.
   */
  function addRows( frag, num ) {
    var item,
        pop;

    while ( num-- ) {
      item = document.createElement( 'div' );
      pop = document.createElement( 'div' );

      item.classList.add( 'riccio__row-item' );
      pop.classList.add( 'riccio__row-pop' );

      frag.appendChild( item );
      frag.appendChild( pop );
    }

    return frag;
  }

  /**
   * Remove the given number of rows from the element.
   *
   * As other functions it counts an item row and a pop row as a single element.
   * So if you remove two rows, it means that you are removing two item rows and
   * two pop rows.
   *
   * This function doesn't check if the rows exist. It will remove the last
   * child of the given element.
   *
   * @param  {Node} frag
   *         The element from which remove rows.
   * @param  {Number} num
   *         The number of rows to remove.
   * @return {Node}
   *         The element without the given number of rows.
   */
  function removeRows( frag, num ) {
    num *= 2;

    while ( num-- ) {
      frag.removeChild( frag.lastChild );
    }

    return frag;
  }

  /**
   * Takes an item element and adds or removes active class, if there is
   * a previous element removes the active class from it.
   *
   * @param  {Node} item
   *         The item element to which add or remove class.
   * @param  {prev} prev
   *         The previous pop or item element to which remove active class.
   * @return {undefined}
   */
  function toggleItem( item, prev ) {
    if ( item.classList.contains( 'riccio__item--active' ) ) {
      item.classList.remove( 'riccio__item--active' );
    }
    else {
      if ( prev ) {
        prev.classList.remove( 'riccio__item--active' );
      }
      item.classList.add( 'riccio__item--active' );
    }
  }

  /**
   * Takes a pop element and adds or removes active class, if there is
   * a previous element removes the active class from it.
   *
   * @param  {Node} pop
   *         The pop element to which add or remove class.
   * @param  {prev} prev
   *         The previous pop element to which remove active class.
   * @return {undefined}
   */
  function togglePop( pop, prev ) {
    if ( pop.classList.contains( 'riccio__pop--active' ) ) {
      pop.classList.remove( 'riccio__pop--active' );
    }
    else {
      if ( prev ) {
        prev.classList.remove( 'riccio__pop--active' );
      }
      pop.classList.add( 'riccio__pop--active' );
    }
  }

  /**
   * Check if a row should be active or not. If active adds a CSS class,
   * otherwise removes it.
   *
   * @param  {Node} row
   *         The row to check if should be active or not.
   * @param  {Node} prev
   *         The previous element to which remove active class.
   * @return {undefined}
   */
  function toggleRow( row, prev ) {
    var active = row.querySelector( '.riccio__pop--active' );

    if ( active ) {
      if ( prev && row !== prev ) {
        prev.classList.remove( 'riccio__row-pop--active' );
        row.classList.add( 'riccio__row-pop--active' );
      }
      else {
        row.classList.add( 'riccio__row-pop--active' );
      }
    }
    else {
      row.classList.remove( 'riccio__row-pop--active' );
    }
  }

  /**
   * Loops over the given element's parents looking for data-riccio attribute.
   * When meet the ending node it stops.
   *
   * @param  {Node} start
   *         The starting element.
   * @param  {Node} end
   *         The ending element.
   * @return {String|Boolean}
   *         The data-riccio value found. If not found return false.
   */
  function getIndex( start, end ) {
    var index = false;

    while ( start !== end ) {
      if ( start.hasAttribute( 'data-riccio' ) ) {
        return start.getAttribute( 'data-riccio' );
      }
      start = start.parentElement;
    }

    return index;
  }

  /**
   * Takes an array of strings and return an array of MediaQueryList.
   *
   * @param  {Array} mediaQueriesString
   *         The array of strings representing mediaQueries.
   * @return {Array}
   *         The array of MediaQueryList.
   */
  function toMediaQueries( mediaQueriesString ) {
    var qrsIndex = mediaQueriesString.length;

    while ( qrsIndex-- ) {
      // Save in mediaQueries my MediaQueryList.
      mediaQueries.push( window.matchMedia( mediaQueriesString[ qrsIndex ] ) );
    }

    return mediaQueries;
  }

  /**
   * Takes the mediaQueries option. If the option is false the function returns
   * false. If the option is an array, convert the array in array of
   * MediaQueryList. Otherwise it try to get mediaQueries from the css and
   * return an array of MediaQueryList.
   *
   * @param  {Boolean|Array} mediaQueriesOption
   *         A boolean indicating if calculate mediaQueries or not, or an array
   *         of strings representing mediaQueries.
   * @return {false|Array}
   *         False or an array of MediaQueryList
   */
  function getMediaQueries( mediaQueriesOption ) {
    if ( !mediaQueriesOption ) {
      return false;
    }
    else if ( Array.isArray( mediaQueriesOption ) ) {
      return toMediaQueries( mediaQueriesOption );
    }

    var styleSheets = document.styleSheets,
        shtIndex = styleSheets.length,
        cssRules = 0,
        rlsIndex = 0;

    while ( shtIndex-- ) {
      try {
        cssRules = styleSheets[ shtIndex ].cssRules;
      }
      catch ( error ) {
        cssRules = 0;
      }
      /*
      When javascript and stylesheets are in files on the local drive
      document.styleSheets[ index ].cssRules return null. This is why Riccio
      doesn't react to media queries change.
       */
      rlsIndex = cssRules ? cssRules.length : 0;

      while ( rlsIndex-- ) {
        if ( cssRules[ rlsIndex ].constructor === CSSMediaRule ) {
          mediaQueries.push( window.matchMedia( cssRules[ rlsIndex ].media.mediaText ) );
        }
      }
    }

    // Filter mediaQueries by media property.
    mediaQueries = unique( mediaQueries );

    return mediaQueries;
  }

  /**
   * Loop over an array of media queries and return an array without duplicates.
   *
   * @param  {Array} array
   *         The media queries array.
   * @return {Array}
   *         An array of media queries without duplicates.
   */
  function unique( array ) {
    var unique = {},
        distinct = [],
        index = array.length;

    while ( index-- ) {
      if ( typeof ( unique[ array[ index ].media ] ) == 'undefined' ) {
        distinct.push( array[ index ] );
      }

      unique[ array[ index ].media ] = 0;
    }

    return distinct;
  }

  /**
   * Check the sign of the given number, and return -1 if negative, 1 if
   * positive and 0 if zero.
   *
   * @param  {number} num
   *         The number to check.
   * @return {Number}
   *         A number indicating the sign of the given number. -1
   *         if negative, 1 if positive and 0 if zero.
   */
  function sign( num ) {
    return num ? num < 0 ? -1 : 1 : 0;
  }


  // Events
  // ---------------------------------------------------------------------------

  /**
   * Attach an event listener to the Riccio object. When user click on a element
   * the relative pop will open or close.
   *
   * @param  {Object} riccio
   *         The riccio object on which attach the event listener.
   * @return {undefined}
   */
  function handleClick( riccio ) {
    riccio.element.addEventListener( 'click', function( event ) {
      var index = getIndex( event.target, event.currentTarget );

      if ( index ) {
        riccio.toggle( index );
      }
    } );
  }

  /**
   * Attach an event listener to the given media queries. When a query is
   * triggered it check if perRow has changed, if so re-init Riccio.
   *
   * @param  {Object} riccio
   *         The riccio object on which attach the event listeners.
   * @return {undefined}
   */
  function handleMediaQueries( riccio ) {
    if ( !riccio.options.mediaQueries ) {
      return;
    }

    var qrsIndex = riccio.options.mediaQueries.length;

    while( qrsIndex-- ) {
      riccio.options.mediaQueries[ qrsIndex ].addListener( callToInit );
    }

    function callToInit() {
      var perRow = getPerRow( riccio.element );

      if ( riccio.options.perRow !== perRow ) {
        riccio.options.perRow = perRow;
        riccio.init();
      }
    }
  }

  // Expose Riccio to the global object.
  window.Riccio = Riccio;

} () );
