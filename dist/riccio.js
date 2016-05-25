( function() {

  'use strict';

  var console = window.console;


  // Constructor
  // ---------------------------------------------------------------------------

  /**
   * Instantiate a new Riccio object.
   *
   * @param  {Node} element
   *         The node on which Riccio will act.
   * @param  {Object} options
   *         An object containing Riccio options.
   * @return {object|Null}
   *         A new Riccio object
   */
  window.Riccio = function( element, options) {

    if ( element.nodeType != Node.ELEMENT_NODE ) {
      if ( console ) {
        console.error( 'Riccio: the given element is not valid.', element );
      }
      return;
    }
    this.element = element;

    // Default options;
    var defaults = {
      item_selector: '',
      pop_selector: '',
      per_row: 3,
      media_queries: true
    };

    if ( arguments[ 1 ] && typeof arguments === 'object' ) {
      this.options = extendDefaults( defaults, arguments[ 1 ] );
    }

    this.options.per_row = getPerRow( this.element );

    var item_store = this.element.querySelectorAll( this.options.item_selector ),
        pop_store = this.element.querySelectorAll( this.options.pop_selector );

    if ( item_store.length != pop_store.length ) {
      if ( console ) {
        console.error( 'Riccio: items number and pops number doesn\'t match.');
      }
      return;
    }

    this.item_store = item_store;
    this.pop_store = pop_store;

    this.init();

    handleClick( this );

    if ( Array.isArray( this.options.media_queries ) ) {
      this.options.media_queries = toMediaQueries( this.options.media_queries );
      handleMediaQueries( this, this.options.media_queries );
    }
    else if ( this.options.media_queries ) {
      this.options.media_queries = getMediaQueries();
      handleMediaQueries( this, this.options.media_queries );
    }
  };


  // Public methods
  // ---------------------------------------------------------------------------

  /**
   * Initialize a Riccio object. This function is called when a new Riccio
   * object is instantiate, or when a breakpoint is triggered.
   */
  Riccio.prototype.init = function() {
    // Add Riccio class.
    this.element.classList.add( 'riccio' );

    var fragment = document.createDocumentFragment(),
        items = this.element.querySelectorAll( this.options.item_selector ),
        itms_index = items.length,
        info = this.needs( itms_index ),
        difference = info.needed - info.having;

    if ( info.having ) {
      var rows = this.element.querySelectorAll( '.riccio__row-item, .riccio__row-pop' ),
          rws_index = rows.length;

      for ( var i = 0; i < rws_index; i++ ) {
        fragment.appendChild( rows[ i ] );
      }
    }

    if ( difference ) {
      if ( Math.sign( difference ) === -1 ) {
        difference *= -1; // Be positive.
        fragment = removeRows( fragment, difference );
      }
      else {
        fragment = addRows( fragment, difference );
      }
    }

    fragment = this.addAll( fragment );

    this.element.appendChild( fragment );
  };

  /**
   * Return the number of rows you have and the number of rows you need to wrap
   * the given number of items.
   *
   * As other functions it counts an item row and the relative pop row as a
   * single element. So if you need two rows, it means that you need two item
   * rows and two pop rows.
   *
   * @param  {Number} num
   *         The number of items you want to add.
   * @return {Object}
   *         An object containing the number of rows you have and the number of
   *         rows you need, keyed by "having" and "needed".
   */
  Riccio.prototype.needs = function( num ) {
    return {
      having: this.element.querySelectorAll( '.riccio__row-item' ).length,
      needed: Math.ceil( num / this.options.per_row )
    };
  };

  /**
   * Takes items and pops in this.element and appends them to the given node.
   * The function doesn't check if there are enough rows, is up to you provide
   * the correct number of rows.
   *
   * @param  {Node} frag
   *         The element to which append items and pops.
   * @return {Node}
   *         The given element with items and pops appended.
   */
  Riccio.prototype.addAll = function( frag ) {
    var item_rows = frag.querySelectorAll( '.riccio__row-item' ),
        pop_rows = frag.querySelectorAll( '.riccio__row-pop' ),
        itm_index = this.item_store.length,
        i = 0, // Items & Pops
        r = 0; // Rows

    while ( i < itm_index ) {
      this.item_store[ i ].setAttribute( 'data-riccio', i );
      this.item_store[ i ].classList.add( 'riccio__item' );
      this.pop_store[ i ].classList.add( 'riccio__pop' );

      item_rows[ r ].appendChild( this.item_store[ i ] );
      pop_rows[ r ].appendChild( this.pop_store[ i ] );

      i++;

      var row_full = i % this.options.per_row;
      if ( !row_full ) {
        r++;
      }
    }

    return frag;
  };

  /**
   * Open or close the element corresponding to the given index.
   *
   * @param {String} index
   *        The index of the pop_store corresponding to the element to open.
   */
  Riccio.prototype.toggle = function( index ) {
    var prev_pop = this.element.querySelector( '.riccio__pop--active' ),
        prev_item = this.element.querySelector( '.riccio__item--active' ),
        prev_row = this.element.querySelector( '.riccio__row-pop--active' );

    toggleItem( this.item_store[ index ], prev_item );
    togglePop( this.pop_store[ index ], prev_pop );
    toggleRow( this.pop_store[ index ].parentElement, prev_row );
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
   * Read the per_row option from CSS. If the option is not found return a
   * default value. The default value is 1.
   * @param  {Element} elem
   *         The element on which look for per_row option.
   * @return {Number}
   *         The number of elements to print in a row.
   */
  function getPerRow( elem ) {
    var computed_style = getComputedStyle( elem, ':before' ),
        per_row = computed_style.getPropertyValue( 'content' );

    if ( per_row === 'none' ) {
      return 3;
    }
    else {
      return parseInt( per_row.slice( 1, -1 ), 10 );
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
   */
  function toggleRow( row, prev ) {
    if ( prev && row != prev ) {
      prev.classList.remove( 'riccio__row-pop--active' );
      row.classList.add( 'riccio__row-pop--active' );
    }
    else {
      row.classList.add( 'riccio__row-pop--active' );
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

    while ( start != end ) {
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
   * @param  {Array} array
   *         The array of strings.
   * @return {Array}
   *         The array of MediaQueryList.
   */
  function toMediaQueries( array ) {
    var mediaqueries = [],
        qrs_index = array.length;

    while ( qrs_index-- ) {
      mediaqueries.push( window.matchMedia( array[ qrs_index ] ) );
    }

    return mediaqueries;
  }

  /**
   * Looks for media quesies in stylesheets and return an array of MediaQueryList.
   *
   * @return {Array}
   *         An array of MediaQueryList.
   */
  function getMediaQueries() {
    var mediaqueries = [],
        stylesheets = document.styleSheets,
        sht_index = stylesheets.length,
        css_rules = 0,
        rls_index = 0;

    while ( sht_index-- ) {
      try {
        css_rules = stylesheets[ sht_index ].cssRules;
      }
      catch ( error ) {
        css_rules = 0;
      }
      /*
      When javascript and stylesheets are in files on the local drive
      document.styleSheets[ index ].cssRules return null. This is why Riccio
      doesn't react to media queries change.
       */
      rls_index = css_rules ? css_rules.length : 0;

      while ( rls_index-- ) {
        if ( css_rules[ rls_index ].constructor === CSSMediaRule ) {
          mediaqueries.push( window.matchMedia( css_rules[ rls_index ].media.mediaText ) );
        }
      }
    }

    // Filter mediaqueries by media property.
    mediaqueries = unique( mediaqueries );

    return mediaqueries;
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


  // Events
  // ---------------------------------------------------------------------------

  /**
   * Attach an event listener to the Riccio object. When user click on a element
   * the relative pop will open or close.
   *
   * @param  {Object} riccio
   *         The riccio object on which attach the event listener.
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
   * triggered it check if per_row has changed, if so re-init Riccio.
   *
   * @param  {Object} riccio
   *         The riccio object on which attach the event listeners.
   * @param  {Array} mediaqueries
   *         An array of MediaQueryList. Listeners will be attached to this
   *         elements.
   */
  function handleMediaQueries( riccio, mediaqueries ) {
    var qrs_index = mediaqueries.length;

    while( qrs_index-- ) {
      mediaqueries[ qrs_index ].addListener( callToInit );
    }

    function callToInit() {
      var per_row = getPerRow( riccio.element );

      if ( riccio.options.per_row != per_row ) {
        riccio.options.per_row = per_row;
        riccio.init();
      }
    }
  }

} () );
