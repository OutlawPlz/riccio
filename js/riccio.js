( function() {

  'use strict';

  var console = window.console;


  // Constructor
  // ---------------------------------------------------------------------------

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
      per_row: 1
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

    var mediaqueries = getMediaQueries();

    if ( mediaqueries.length ) {
      handleMediaQueries( this, mediaqueries );
    }
  };


  // Public methods
  // ---------------------------------------------------------------------------

  Riccio.prototype.init = function() {
    // Add Riccio class.
    this.element.classList.add( 'riccio' );

    var fragment = document.createDocumentFragment(),
        items = this.element.querySelectorAll( this.options.item_selector ),
        itms_index = items.length,
        info = this.needs( itms_index ),
        difference = info.needed - info.having;

    if ( info.having ) {
      var rows = this.element.querySelectorAll( '.riccio__row' ),
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
      having: this.element.querySelectorAll( 'riccio__row' ).length / 2,
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
    var item_rows = frag.querySelectorAll( '.riccio__row:nth-child(odd)' ),
        pop_rows = frag.querySelectorAll( '.riccio__row:nth-child(even)' ),
        item_store = this.element.querySelectorAll( this.options.item_selector ),
        pop_store = this.element.querySelectorAll( this.options.pop_selector ),
        itm_index = item_store.length,
        i = 0, // Items & Pops
        r = 0; // Rows

    while ( i < itm_index ) {
      item_store[ i ].setAttribute( 'data-riccio', i );
      item_store[ i ].classList.add( 'riccio__item' );
      pop_store[ i ].classList.add( 'riccio__pop' );

      item_rows[ r ].appendChild( item_store[ i ] );
      pop_rows[ r ].appendChild( pop_store[ i ] );

      i++;

      var row_full = i % this.options.per_row;
      if ( !row_full ) {
        r++;
      }
    }

    return frag;
  };

  /**
   * Open the given pop.
   *
   * @param  {Node} elem
   *         The pop to open.
   */
  Riccio.prototype.open = function( elem ) { // @todo To remove. Only toggle.
    elem.classList.add( 'riccio__pop--active' );
  };

  /**
   * Close the given pop.
   *
   * @param  {Node} elem
   *         The pop to close.
   */
  Riccio.prototype.close = function( elem ) { // @todo To remove. Only toggle.
    elem.classList.remove( 'riccio__pop--active' );
  };

  /**
   * Open or close the given pop, closing all the others.
   *
   * @param  {Node} elem
   *         The pop to open or close.
   */
  Riccio.prototype.toggle = function( elem ) {
    var active = this.element.querySelectorAll( '.riccio__pop--active' ),
        act_index = active.length,
        row = elem.parentElement;

    if ( elem.classList.contains( 'riccio__pop--active' ) ) {
      while ( act_index-- ) {
        this.close( active[ act_index ] );
      }
    }
    else {
      while ( act_index-- ) {
        this.close( active[ act_index ] );
      }
      this.open( elem );
    }

    toggleRow( row );
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
   * @param  {Node} elem
   *         The element on which look for per_row option.
   * @return {Number}
   *         The number of elements to print in a row.
   */
  function getPerRow( elem ) {
    var computed_style = getComputedStyle( elem, ':before' ),
        per_row = computed_style.getPropertyValue( 'content' );

    if ( per_row === 'none' ) {
      return 1;
    }
    else {
      return per_row.slice( 1, -1 );
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
    num *= 2;

    var row;

    while ( num-- ) {
      row = document.createElement( 'div' );
      row.classList.add( 'riccio__row' );
      frag.appendChild( row );
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
   * Check if a row should be active or not. If active adds a CSS class,
   * otherwise removes it.
   *
   * @param  {Node} elem
   *         The row to check if should be active or not.
   */
  function toggleRow( elem ) {
    var active = row.querySelector( '.riccio__pop--active' );

    if ( active ) {
      row.classList.add( 'riccio__row--active' );
    }
    else {
      row.classList.remove( 'riccio__row--active' );
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
   * @return {String}
   *         The data-riccio value found. If not found return false.
   */
  function getIndex( start, end ) {
    var index = false,
        parent = start;

    while ( parent != end ) {
      if ( parent.hasAttribute( 'data-riccio' ) ) {
        index = parent.getAttribute( 'data-riccio' );
        break;
      }
      parent = parent.parentElement;
    }

    return index;
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

    return mediaqueries;
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
        riccio.toggle( riccio.pop_store[ index ] );
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
   *         An array of MediaQueryList. Listeners will be attached to this elements.
   */
  function handleMediaQueries( riccio, mediaqueries ) {
    var qrs_index = mediaqueries.length;

    while( qrs_index-- ) {
      mediaqueries[ qrs_index ].addListener( idontlike );
    }

    function idontlike( mediaquery ) {
      var per_row = getPerRow( riccio.element );

      if ( riccio.options.per_row != per_row ) {
        riccio.options.per_row = per_row;
        riccio.init();
      }
    }
  }

} )();
