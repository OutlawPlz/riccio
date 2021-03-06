/**
 * Riccio - v1.2.0
 * Adaptive grid view with expanding info box.
 * By OutlawPlz, license GPL-3.0.
 * https://github.com/OutlawPlz/riccio.git
 */
// Implements Element.prototype.classList() - v1.1.20150312
// By Eli Grey, http://eligrey.com
if ("document" in self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
  if (!("classList" in document.createElement("_"))
    || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

    (function (view) {

      "use strict";

      if (!('Element' in view)) return;

      var
        classListProp = "classList"
        , protoProp = "prototype"
        , elemCtrProto = view.Element[protoProp]
        , objCtr = Object
        , strTrim = String[protoProp].trim || function () {
            return this.replace(/^\s+|\s+$/g, "");
          }
        , arrIndexOf = Array[protoProp].indexOf || function (item) {
            var
              i = 0
              , len = this.length
              ;
            for (; i < len; i++) {
              if (i in this && this[i] === item) {
                return i;
              }
            }
            return -1;
          }
        // Vendors: please allow content code to instantiate DOMExceptions
        , DOMEx = function (type, message) {
          this.name = type;
          this.code = DOMException[type];
          this.message = message;
        }
        , checkTokenAndGetIndex = function (classList, token) {
          if (token === "") {
            throw new DOMEx(
              "SYNTAX_ERR"
              , "An invalid or illegal string was specified"
            );
          }
          if (/\s/.test(token)) {
            throw new DOMEx(
              "INVALID_CHARACTER_ERR"
              , "String contains an invalid character"
            );
          }
          return arrIndexOf.call(classList, token);
        }
        , ClassList = function (elem) {
          var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
            , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
            , i = 0
            , len = classes.length
            ;
          for (; i < len; i++) {
            this.push(classes[i]);
          }
          this._updateClassName = function () {
            elem.setAttribute("class", this.toString());
          };
        }
        , classListProto = ClassList[protoProp] = []
        , classListGetter = function () {
          return new ClassList(this);
        }
        ;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
      DOMEx[protoProp] = Error[protoProp];
      classListProto.item = function (i) {
        return this[i] || null;
      };
      classListProto.contains = function (token) {
        token += "";
        return checkTokenAndGetIndex(this, token) !== -1;
      };
      classListProto.add = function () {
        var
          tokens = arguments
          , i = 0
          , l = tokens.length
          , token
          , updated = false
          ;
        do {
          token = tokens[i] + "";
          if (checkTokenAndGetIndex(this, token) === -1) {
            this.push(token);
            updated = true;
          }
        }
        while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.remove = function () {
        var
          tokens = arguments
          , i = 0
          , l = tokens.length
          , token
          , updated = false
          , index
          ;
        do {
          token = tokens[i] + "";
          index = checkTokenAndGetIndex(this, token);
          while (index !== -1) {
            this.splice(index, 1);
            updated = true;
            index = checkTokenAndGetIndex(this, token);
          }
        }
        while (++i < l);

        if (updated) {
          this._updateClassName();
        }
      };
      classListProto.toggle = function (token, force) {
        token += "";

        var
          result = this.contains(token)
          , method = result ?
            force !== true && "remove"
            :
            force !== false && "add"
          ;

        if (method) {
          this[method](token);
        }

        if (force === true || force === false) {
          return force;
        } else {
          return !result;
        }
      };
      classListProto.toString = function () {
        return this.join(" ");
      };

      if (objCtr.defineProperty) {
        var classListPropDesc = {
          get: classListGetter
          , enumerable: true
          , configurable: true
        };
        try {
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        } catch (ex) { // IE 8 doesn't support enumerable:true
          if (ex.number === -0x7FF5EC54) {
            classListPropDesc.enumerable = false;
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
          }
        }
      } else if (objCtr[protoProp].__defineGetter__) {
        elemCtrProto.__defineGetter__(classListProp, classListGetter);
      }

    }(self));

  } else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());

  }

}

/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
  "use strict";

  // For browsers that support matchMedium api such as IE 9 and webkit
  var styleMedia = (window.styleMedia || window.media);

  // For those that don't support matchMedium
  if (!styleMedia) {
    var style = document.createElement('style'),
        script = document.getElementsByTagName('script')[0],
        info = null;

    style.type = 'text/css';
    style.id = 'matchmediajs-test';

    script.parentNode.insertBefore(style, script);

    // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
    info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

    styleMedia = {
      matchMedium: function(media) {
        var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

        // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
        if (style.styleSheet) {
          style.styleSheet.cssText = text;
        } else {
          style.textContent = text;
        }

        // Test if media query is true or false
        return info.width === '1px';
      }
    };
  }

  return function(media) {
    return {
      matches: styleMedia.matchMedium(media || 'all'),
      media: media || 'all'
    };
  };
}());

/*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license */
(function(){
  // Bail out for browsers that have addListener support
  if (window.matchMedia && window.matchMedia('all').addListener) {
    return false;
  }

  var localMatchMedia = window.matchMedia,
      hasMediaQueries = localMatchMedia('only all').matches,
      isListening = false,
      timeoutID = 0,    // setTimeout for debouncing 'handleChange'
      queries = [];   // Contains each 'mql' and associated 'listeners' if 'addListener' is used

  var handleChange = function(evt) {
    // Debounce
    clearTimeout(timeoutID);

    timeoutID = setTimeout(function() {
      for (var i = 0, il = queries.length; i < il; i++) {
        var mql         = queries[i].mql,
          listeners   = queries[i].listeners || [],
          matches     = localMatchMedia(mql.media).matches;

        // Update mql.matches value and call listeners
        // Fire listeners only if transitioning to or from matched state
        if (matches !== mql.matches) {
          mql.matches = matches;

          for (var j = 0, jl = listeners.length; j < jl; j++) {
            listeners[j].call(window, mql);
          }
        }
      }
    }, 30);
  };

  window.matchMedia = function(media) {
    var mql         = localMatchMedia(media),
      listeners   = [],
      index       = 0;

    mql.addListener = function(listener) {
      // Changes would not occur to css media type so return now (Affects IE <= 8)
      if (!hasMediaQueries) {
        return;
      }

      // Set up 'resize' listener for browsers that support CSS3 media queries (Not for IE <= 8)
      // There should only ever be 1 resize listener running for performance
      if (!isListening) {
        isListening = true;
        window.addEventListener('resize', handleChange, true);
      }

      // Push object only if it has not been pushed already
      if (index === 0) {
        index = queries.push({
          mql         : mql,
          listeners   : listeners
        });
      }

      listeners.push(listener);
    };

    mql.removeListener = function(listener) {
      for (var i = 0, il = listeners.length; i < il; i++){
        if (listeners[i] === listener){
          listeners.splice(i, 1);
        }
      }
    };

    return mql;
  };
}());

 /*
  * Riccio - Adaptive grid view with expanding info box.
  */

( function ( window, factory ) {

  // AMD
  if ( typeof define === 'function' && define.amd ) {
    define( [], factory );
  }
  // CommonJS
  else if ( typeof exports === 'object' ) {
    module.exports = factory();
  }
  // Browser global
  else {
    window.Riccio = factory();
  }

} ( window, function () {

  'use strict';

  var console = window.console,
      mediaQueriesStore = {},
      riccioStore = [];


  // Constructor
  // ---------------------------------------------------------------------------

  /**
   * Instantiate a new Riccio object.
   *
   * @param  {Element} element
   *   The node on which Riccio will act.
   * @param  {Object} options
   *   An object containing Riccio options.
   *
   * @return {Riccio|undefined}
   *   A new Riccio object.
   */
  function Riccio ( element, options ) {

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

    // Init Riccio.
    this.init();
  }


  // Public methods
  // ---------------------------------------------------------------------------

  /**
   * Initialize a Riccio object. It adds Riccio CSS classes and events.
   */
  Riccio.prototype.init = function() {

    // Add Riccio CSS class.
    this.element.classList.add( 'riccio' );

    // If mediaQueries is true or an array, call getMediaQueries.
    if ( this.options.mediaQueries ) {
      getMediaQueries( this.options.mediaQueries );
    }

    // Add events.
    document.body.addEventListener( 'click', clickHandler );

    for ( var mediaQueryText in mediaQueriesStore ) {
      mediaQueriesStore[ mediaQueryText ].addListener( mediaQueryHandler );
    }

    // Define itemStore and popStore. Will be populated in buildLayout().
    this.itemStore = null;
    this.popStore = null;

    // Save original element and its parent to facilitate destroyLayout()
    // method.
    this.originalElement = this.element.cloneNode( true );
    this.originalElementParent = this.element.parentNode;

    // Build layout.
    this.buildLayout();

    // Add current object to the store.
    riccioStore.push( this );
  };

  /**
   * Reset a Riccio instance to a pre-init state. It removes Riccio CSS classes,
   * events and layout.
   */
  /*
  Riccio.prototype.destroy = function () {

    // If not initialized do not destroy.
    if ( !Riccio.prototype.isInitialized( this ) ) {
      return;
    }

    // Remove CSS classes.
    this.element.classList.remove( 'riccio' );

    // Remove instance from the store.
    for ( var i = riccioStore.length, riccio; i--, riccio = riccioStore[ i ]; ) {
      if ( riccio === this ) {
        riccioStore.splice( i, 1 );
      }
    }
  };
  */

  /**
   * Builds the Riccio layout. This function is called when a breakpoint is
   * triggered.
   */
  Riccio.prototype.buildLayout = function () {

    // If empty, populate itemStore and popStore.
    if ( !this.itemStore && !this.popStore ) {
      this.itemStore = this.element.querySelectorAll( this.options.itemSelector );
      this.popStore = this.element.querySelectorAll( this.options.popSelector );
    }

    var fragment = document.createDocumentFragment(),
        activePop = this.element.querySelector( '.riccio__pop--active' ),
        prevRow = this.element.querySelector( '.riccio__row-pop--active' ),
        info = needs( this.element, this.options.itemSelector, this.options.perRow );

    fragment = setRows( fragment, this.element, info );
    fragment = setItems( fragment, this.itemStore, this.popStore, this.options.perRow );

    this.element.appendChild( fragment );

    if ( activePop ) {
      toggleRow( activePop.parentElement, prevRow );
    }
  };

  /**
   * Reset the layout in a state previous of buildLayout() method.
   */
  Riccio.prototype.destroyLayout = function() {

    // Cloning the original element. The original should never be touched.
    var clone = this.originalElement.cloneNode( true );

    // Replace current layout with a clone of the original layout.
    this.originalElementParent.replaceChild( clone, this.element );
    // I have to replace Riccio.element with a clone of the original layout.
    this.element = clone;

    // Reset popStore and itemStore, so buildLayout() can recalculate them.
    this.popStore = null;
    this.itemStore = null;

    // I don't have to remove CSS classes and attributes because they was added
    // after saving the original layout.
  }

  /**
   * Return the number of rows you have and the number of rows you need to wrap
   * the items.
   *
   * As other functions it counts an item row and the relative pop row as a
   * single element. So if you need two rows, it means that you need two item
   * rows and two pop rows.
   *
   * @return {Object}
   *   An object containing the number of rows you have and the number of rows
   *   you need, keyed by "having" and "needed".
   *
   * @deprecated Integrated in buildLayout(). Will be removed in v2.0.0.
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
   * @param  {Element} fragment
   *   The element to which append items and pops.
   *
   * @return {Element}
   *   The given element with items and pops appended.
   *
   * @deprecated Use buildLayout() instead. Will be removed in v2.0.0.
   */
  Riccio.prototype.setItems = function( fragment ) {

    var itemRows = fragment.querySelectorAll( '.riccio__row-item' ),
        popRows = fragment.querySelectorAll( '.riccio__row-pop' ),
        itmIndex = this.itemStore.length,
        i = 0, // Items & Pops
        r = 0; // Rows

    while ( i < itmIndex ) {
      this.itemStore[ i ].setAttribute( 'data-riccio-item', i.toString() );
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
   * Return the given fragment with the right number of pops and items rows.
   *
   * @param  {DocumentFragment} fragment
   *   The fragment to which append rows.
   *
   * @return {DocumentFragment}
   *   The given fragment with rows appended.
   *
   * @deprecated Use buildLayout() instead. Will be removed in v2.0.0.
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
   *   The index of the popStore corresponding to the element to open.
   */
  Riccio.prototype.toggle = function( index ) {

    var prevPop = this.element.querySelector( '.riccio__pop--active' ),
        prevItem = this.element.querySelector( '.riccio__item--active' ),
        prevRow = this.element.querySelector( '.riccio__row-pop--active' );

    toggleItem( this.itemStore[ index ], prevItem );
    togglePop( this.popStore[ index ], prevPop );
    toggleRow( this.popStore[ index ].parentElement, prevRow );
  };


  // Static methods
  // ---------------------------------------------------------------------------

  /**
   * Check if the given Riccio instance was initialized.
   *
   * @param  {Riccio} riccio
   *   A Riccio instance to check.
   *
   * @return {Boolean}
   *   True if the given Riccio instance was initialized, false otherwise.
   */
  Riccio.prototype.isInitialized = function ( riccio ) {

    for ( var i = riccioStore.length, inStore; i--, inStore = riccioStore[ i ]; ) {
      if ( riccio === inStore ) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return an array containing all Riccio's instances.
   *
   * @return {Array}
   *   An array containing all Riccio's instances.
   *
   * @deprecated Will be removed in v2.0.0.
   */
  Riccio.prototype.getStore = function() {

    return riccioStore;
  };

  /**
   * Return the Riccio instance used by the given element.
   *
   * @param  {Element} element
   *   The element used at Riccio creation.

   * @return {Riccio|undefined}
   *   The Riccio instance used by the given element. If none instance is found,
   *   return undefined.
   */
  Riccio.prototype.getInstance = function ( element ) {

    for ( var i = riccioStore.length, riccio; i--, riccio = riccioStore[ i ]; ) {
      if ( riccio.element === element ) {
        return riccio;
      }
    }
  };


  // Private methods
  // ---------------------------------------------------------------------------

  /**
   * Returns the number of row you have and the number of row you need to wrap
   * the items.
   *
   * Ad other functions it counts an item row and the relative pop row as a
   * single element. If you need two rows, it means you need two items rows and
   * two pop rows.
   *
   * @param element
   *   The element containing Riccio items.
   * @param itemSelector
   *   The CSS selector of items.
   * @param perRow
   *   The number of items to fin in a row.
   *
   * @return {{having: number, needed: number}}
   *   An object containing the number of rows you have and the number row you
   *   need, keyed by "having" and "needed".
   */
  function needs( element, itemSelector, perRow ) {

    var itemsLenght = element.querySelectorAll( itemSelector ).length;

    return {
      having: element.querySelectorAll( '.riccio__row-item' ).length,
      needed: Math.ceil( itemsLenght / perRow )
    }
  }

  /**
   * Return the given fragment with the right number of pops and items rows.
   *
   * @param {DocumentFragment} fragment
   *   The fragment to which append rows.
   * @param {Element} element
   *   The element containing pop and item elements.
   * @param {Object} needs
   *   The object returned by the needs() function.
   *
   * @return {DocumentFragment}
   *   The given fragment with rows appended.
   */
  function setRows( fragment, element, needs ) {

    // Check if I already have rows.
    if ( needs.having ) {
      var rows = element.querySelectorAll( '.riccio__row-item, .riccio__row-pop' );
      // Append having rows to the fragment.
      for ( var i = rows.length, j = 0, row; j < i, row = rows[ j ]; j++ ) {
        fragment.appendChild( row );
      }
    }

    var difference = needs.needed - needs.having;

    // If difference is zero, everything set. Do nothing, return the fragment.
    if ( !difference ) {
      return fragment;
    }

    // If difference is negative, I should remove some rows.
    if ( sign( difference ) === -1 ) {
      difference *= -1; // Be positive.
      fragment = removeRows( fragment, difference );
    }
    // Otherwise I should add some rows.
    else {
      fragment = addRows( fragment, difference );
    }

    return fragment;
  }

  /**
   * Takes items and pops and appends them to the given fragment.
   * The function doesn't check if there are enough rows, it's up to you provide
   * the correct number of rows.
   *
   * @param {DocumentFragment} fragment
   *   The document fragment to which append pops and items.
   * @param {NodeList} itemStore
   *   The NodeList containing items.
   * @param {NodeList} popStore
   *   The NodeList containing pops.
   * @param {Number} perRow
   *
   * @return {DocumentFragment}
   *   The given fragment with pops and items appended.
   */
  function setItems( fragment, itemStore, popStore, perRow ) {

    var itemRows = fragment.querySelectorAll( '.riccio__row-item' ),
        popRows = fragment.querySelectorAll( '.riccio__row-pop' );
    // Set loop variables.
    var item, pop, index = 0, rowIndex = 0;

    // Loop over pops and items.
    for ( var i = itemStore.length; index < i, item = itemStore[ index ], pop = popStore[ index ]; ) {

      // Add attributes to pop and item.
      item.setAttribute( 'data-riccio-item', index.toString() );
      item.classList.add( 'riccio__item' );
      pop.setAttribute( 'data-riccio-pop', index.toString() );
      pop.classList.add( 'riccio__pop' );

      // Append pop and item to the relative row.
      itemRows[ rowIndex ].appendChild( item );
      popRows[ rowIndex ].appendChild( pop );

      index++;

      // If the row is full, go to the next row.
      if ( !( index % perRow) ) {
        rowIndex++
      }
    }

    return fragment;
  }

  /**
   * Take an object, loop through its properties, and if it isn't an internal
   * property, assigns it to the source object.
   *
   * @param  {Object} source
   *   An object representing the default options.
   * @param  {Object} properties
   *   An object representing the user options.
   *
   * @return {Object}
   *   An updated object with merged options.
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
   *
   * @param  {Element} elem
   *   The element on which look for perRow option.
   *
   * @return {Number}
   *   The number of elements to print in a row.
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
   * @param  {DocumentFragment} fragment
   *   The fragment to which add the rows.
   * @param  {Number} number
   *   The number of rows to add.
   *
   * @return {DocumentFragment}
   *   The given fragment with the given number of rows.
   */
  function addRows( fragment, number ) {

    var item, pop;

    while ( number-- ) {
      // Create the item row and the pop row.
      item = document.createElement( 'div' );
      pop = document.createElement( 'div' );
      // Add CSS classes to them.
      item.classList.add( 'riccio__row-item' );
      pop.classList.add( 'riccio__row-pop' );

      // Append rows to the given fragment.
      fragment.appendChild( item );
      fragment.appendChild( pop );
    }

    return fragment;
  }

  /**
   * Remove the given number of rows from the element.
   *
   * @param  {DocumentFragment} fragment
   *   The fragment from which remove rows.
   * @param  {Number} number
   *   The number of rows to remove.
   *
   * @return {DocumentFragment}
   *   The fragment without the given number of rows.
   */
  function removeRows( fragment, number ) {

    // Twice, because if we remove an item row we should remove the relative
    // pop row too.
    number *= 2;

    while ( number-- ) {
      fragment.removeChild( fragment.lastChild );
    }

    return fragment;
  }

  /**
   * Takes an item element and adds or removes active class, if there is
   * a previous element removes the active class from it.
   *
   * @param  {Element} item
   *   The item element to which add or remove class.
   * @param  {Element} prev
   *   The previous pop or item element to which remove active class.
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
   * @param  {Element} pop
   *   The pop element to which add or remove class.
   * @param  {Element} prev
   *   The previous pop element to which remove active class.
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
   * @param  {Element} row
   *   The row to check if should be active or not.
   * @param  {Element} prev
   *   The previous element to which remove active class.
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
   * Loops over the given element's parents looking for data-riccio-item
   * attribute. When meet the ending node it stops.
   *
   * @param  {Element} start
   *   The starting element.
   * @param  {Element} end
   *   The ending element.
   *
   * @return {String|Boolean}
   *   The data-riccio-item value found. If not found return false.
   */
  function getIndex( start, end ) {

    var index = false;

    while ( start !== end ) {
      if ( start.hasAttribute( 'data-riccio-item' ) ) {
        return start.getAttribute( 'data-riccio-item' );
      }
      start = start.parentNode;
    }

    return index;
  }

  /**
   * If mediaQueriesStore is empty, call getMediaQueriesFromCss().
   * If mediaQueriesOption is an array, convert string into a MediaQueryList
   * object and add it to mediaQueriesStore. If mediaQueriesOption is true,
   * do nothing.
   *
   * @param {Boolean|Array} mediaQueriesOption
   *   A boolean indicating if calculate media-queries or not, or an array of
   *   strings representing media-queries.
   */
  function getMediaQueries( mediaQueriesOption ) {

    // If mediaQueriesStore is empty, get media-queries from CSS. This way
    // media-queries are calculated only once from CSS.
    if ( !Object.keys( mediaQueriesStore ).length ) {
      getMediaQueriesFromCss();
    }

    // If mediaQueriesOption is an array.
    if ( mediaQueriesOption instanceof Array ) {
      // Loop over the entries.
      for ( var i = mediaQueriesOption.length, mediaQueryText; i--, mediaQueryText = mediaQueriesOption[ i ]; ) {
        // And if the media-query is not in the mediaQueriesStore, add it.
        if ( !mediaQueriesStore.hasOwnProperty( mediaQueryText ) ) {
          mediaQueriesStore[ mediaQueryText ] = window.matchMedia( mediaQueryText );
        }
      }
    }
  }

  /**
   * Try to get media-queries from CSS.
   */
  function getMediaQueriesFromCss () {

    // Loop over style-sheets.
    for ( var i = document.styleSheets.length, styleSheet; i--, styleSheet = document.styleSheets[ i ]; ) {

      // Try to access the style-sheet css rules. If can't access, skip it to
      // prevent security errors.
      // @see https://developer.mozilla.org/it/docs/Web/API/CSSStyleSheet#Notes
      try {
        styleSheet.cssRules.length;
      }
      catch ( error ) {
        continue;
      }

      // Loop over css rules.
      for ( var j = styleSheet.cssRules.length, cssRule; j--, cssRule = styleSheet.cssRules[ j ]; ) {
        // Look for media rules that are not listed in mediaQueriesStore array.
        if ( cssRule.constructor === CSSMediaRule && !mediaQueriesStore[ cssRule.media.mediaText ] ) {
          // Add mediaQueryList object to mediaQueriesStore array.
          mediaQueriesStore[ cssRule.media.mediaText ] = window.matchMedia( cssRule.media );
        }
      }
    }
  }

  /**
   * Check the sign of the given number, and return -1 if negative, 1 if
   * positive and 0 if zero.
   *
   * @param  {Number} num
   *   The number to check.
   *
   * @return {Number}
   *   A number indicating the sign of the given number. -1 if negative, 1 if
   *   positive and 0 if zero.
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
   * @param event
   */
  function clickHandler( event ) {

    // For each Riccio in riccioStore...
    for ( var i = riccioStore.length, riccio; i--, riccio = riccioStore[ i ]; ) {
      // Check if I've clicked in a Riccio instance.
      if ( !riccio.element.contains( event.target ) ) {
        // I'm not in a Riccio instance...
        continue;
      }

      // Get the item I've clicked on.
      var index = getIndex( event.target, riccio.element );
      // Check if I've clicked in a item and toggle it.
      if ( index ) {
        riccio.toggle( index );
      }
    }
  }

  /**
   * When a MediaQuery is triggered it checks if perRow option has changed, then
   * re-build layout if needed.
   *
   * @param event
   */
  function mediaQueryHandler( event ) {

    // If the media query is not matched, do nothing.
    if ( !event.matches ) {
      return;
    }

    // Loop over Riccio instances.
    for ( var i = riccioStore.length, riccio; i--, riccio = riccioStore[ i ]; ) {
      // If riccio instance has mediaQueries set to false, do nothing.
      if ( !riccio.options.mediaQueries ) {
        return;
      }

      // Calculate perRow option.
      var perRow = getPerRow( riccio.element );

      // If perRow is changed, re-build layout and set new perRow into options.
      if ( riccio.options.perRow !== perRow ) {
        riccio.options.perRow = perRow;
        riccio.buildLayout();
      }
    }
  }


  // Expose & Init
  // ---------------------------------------------------------------------------

  // Init via HTML.
  var elements = document.querySelectorAll( '[data-riccio]' );

  for ( var i = elements.length, element; i--, element = elements[ i ]; ) {
    new Riccio( element, JSON.parse( element.getAttribute( 'data-riccio' ) ) );
  }

  // Expose Riccio to the global object.
  return Riccio;

} ) );
