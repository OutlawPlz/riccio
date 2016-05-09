var gulp = require( 'gulp' ),
    jshint = require( 'gulp-jshint' ),
    uglifyjs2 = require( 'gulp-minify' ),
    sass = require( 'gulp-sass' ),
    autoprefixer = require( 'gulp-autoprefixer' ),
    cssnano = require( 'gulp-cssnano' ),
    rename = require( 'gulp-rename' );

var sassInput = './styles/scss/**/*.scss',
    sassOutput = './styles/css';

var jsInput = './js/**/*.js';


// Options
// -----------------------------------------------------------------------------

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var autoprefixerOptions = {};

var uglifyjs2Options = {
  ext: {
    min: '.min.js'
  }
};

// Tasks
// -----------------------------------------------------------------------------

gulp.task( 'styles', function() {
  return gulp.src( sassInput )
    .pipe( sass( sassOptions ) ).on( 'error', sass.logError )
    .pipe( autoprefixer() )
    .pipe( gulp.dest( sassOutput ) );
} );

gulp.task( 'js', function() {
  return gulp.src( jsInput )
    .pipe( jshint() )
    .pipe( jshint.reporter( 'default' ) );
} );

gulp.task( 'minify-css', function() {
  return gulp.src( './styles/css/riccio.css' )
    .pipe( gulp.dest( './dist' ) )
    .pipe( cssnano() )
    .pipe( rename( 'riccio.min.css' ) )
    .pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'minify-js', function() {
  return gulp.src( './js/riccio.js' )
    .pipe( uglifyjs2( uglifyjs2Options ) )
    .pipe( gulp.dest( './dist' ) );
} );

gulp.task( 'dist', ['styles', 'minify-css', 'minify-js'],function() {} );
