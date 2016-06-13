# Riccio

Adaptive grid view whith expanding info box.

Have you ever seen the iTunes Album view or the Google Image grid? With this
little JavaScript you can implements those view in no time.

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
  perRow: 3, // This value will be calculated from your CSS.
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

### itemSelector

It's a valid CSS selector of your grid items. Riccio cuts this elements and
print them into the grid item rows. The items number and pops number must be the
same, otherwise Riccio returns an error.

### popSelector

It's a valid CSS selector of your grid pops. Riccio cuts this elements and print
them into the grid pop rows.

### perRow

Riccio gets this options from your CSS. This way you can change the layout of
your grid in CSS using the media queries. If you're not using media queries set
this option to the number of items you want to display in a row.

### mediaQueries

If you set this option to `true`, Riccio try to get media queries from your CSS.
However we know that this function doesn't play nice with at-rules, such as
`@import` or `@charset`.

If this is your case, you can set this option to an array of media queries, or
to `false` to completly disable the function.

```js
// Media queries array.
var riccio = new Riccio( element, {
  mediaQueries: [
    '(max-width: 560px)',
    '(min-width: 561px)'
  ]
} );
```


[de0e5714]: https://github.com/OutlawPlz "Download"
