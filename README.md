# Riccio

Adaptive grid view whith expanding info box.

Have you ever seen the iTunes Album view or the Google Image grid? With this
little JavaScript you can implement those view in no time.

## Quick Start

Start using Riccio in three steps.

1. Download latest Riccio package from [Github][de0e5714]. Add
`dist/riccio.min.js` and `dist/riccio.min.css` to your web page.
  ```html
  <link href="/path/to/riccio.min.css" rel="stylesheet" media="screen">
  ```
  ```html
  <script src="/path/to/riccio.min.js"></script>
  ```

2. Set your grid layout in CSS. Using the `::before` selector you can set the
number of items to print in a row. Change the layout using the media queries.
   ```css
  @media (max-width: 560px) {
    .album-view::before {
      content: '2';
    }
  }
  ```
  ```css
  @media (min-width: 561px) {
    .album-view::before {
      content: '5';
    }
  }
  ```

3. Initialize Riccio in a custom script.
  ```js
  var element = document.querySelector( '.album-view' );
  // Initialize Riccio.
  var riccio = new Riccio( element, {
    itemSelector: '.album',
    popSelector: '.album__track-list',
  } );
  ```

That's it. You’re all set to start using Riccio.

## Options

Riccio accepts an object of options. `itemSelector` and `popSelector` are
*required*, while `mediaQueries` and `perRow` will be calculated from your CSS.

```js
// Default options.
var riccio = new Riccio( element, {
  itemSelector: '', // A valid CSS selector.
  popSelector: '', // A valid CSS selector.
  perRow: true, // This value will be calculated from your CSS.
  mediaQueries: true // True, false or an array of string representing the media queries.
} );
```

```html
<div class="album-view"> <!-- The Riccio's element -->
  <div class="album"> <!-- The item selector -->
    <img src="#">
    <h3 class="album__title">Album title</h3>
    <ul class="album__track-list"> <!-- The pop selector -->
      <li>Track #1</li>
      <li>Track #2</li>
      <li>Track #3</li>
    </ul>
  </div>
</div>
```

- ***itemSelector*** - It's a valid CSS selector of your grid items. Riccio cuts
this elements and print them into the grid item rows. The items number and pops
number must be the same, otherwise Riccio returns an error.

- ***popSelector*** - It's a valid CSS selector of your grid pops. Riccio cuts
this elements and print them into the grid pop rows.

- ***perRow*** - If set to `true` Riccio gets this options from your CSS. This
way you can change the layout of your grid in CSS using the media queries. If
you're not using media queries set this option to the number of items you want
to display in a row.

- ***mediaQueries*** - If you set this option to `true`, Riccio try to get media
queries from your CSS. However we know that this function doesn't play nice with
at-rules, such as `@import` or `@charset`. If this is your case, you can set
this option to an array of media queries, or to `false` to completly disable the
function.

```js
// Media queries array.
var riccio = new Riccio( element, {
  mediaQueries: [
    '(max-width: 560px)',
    '(min-width: 561px)'
  ]
} );
```

## Methods

Methods are actions done by Riccio instances.

```js
// Instantiate new Riccio object.
var riccio = new Riccio( element, {
  itemSelector: '.album',
  popSelector: '.album__track-list'
} );
```

### init()

Initialize a Riccio object. This function is called when a new Riccio object is
instantiate, or when a breakpoint is triggered.

```js
// Init Riccio object.
riccio.init();
```

### needs()

Return the number of rows you have and the number of rows you need to wrap the
items. Ad other functions it count an intem row and the relative pop row as a
single element. So if you need two rows, it means that you need two item rows
and two pop rows.

```js
// Get the number of roww you have and the number of row you need.
riccio.needs();
```

### setItems( fragment )

Takes items and pops and appends them to the given fragment. The
function doesn't check if there are enough rows, it's up to you provide the
correct number of rows.

```js
// Appends pop and item element to the relative rows.
riccio.setItems( fragment )
```

### setRows( fragment )

Ask to needs() function how many pop rows and item rows we have. Then append the
rigth number of rows to the given fragment.

```js
// Set the rigth number of rows.
riccio.setRows( fragment );
```

### toggle( index )

Open or close the element corresponding to the given index.

```js
riccio.toggle( index );
```

### appendItems( array )

...

### prependItems( array )

...

[de0e5714]: https://github.com/OutlawPlz "Download"
