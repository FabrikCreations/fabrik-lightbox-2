var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify-es').default;
var rename = require('gulp-rename');

var DEST = './dist/';

gulp.task('clean', (done) => {
    del.sync([
        DEST + '**/*',
    ]);
    done();
});

gulp.task('scripts', () => {
    return gulp.src(['./src/js/lg-core.js', './src/js/lg-fullscreen.js', './src/js/lg-video.js', './src/js/lg-zoom.js'])
        .pipe(concat('js/lg.js'))
        .pipe(gulp.dest(DEST))
        .pipe(uglify())
        .on('error', function (err) {
            console.log('error', err);
        })
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(DEST));
    });

gulp.task('less', () => {
    return gulp.src('./src/less/core.less')
        .pipe(rename('less/lg.less'))
        .pipe(gulp.dest(DEST));
});

gulp.task('css', () => {
    return gulp.src('./src/less/lg.less')
      .pipe(less())
      .pipe(rename('css/lg.css'))
      .pipe(gulp.dest(DEST))
      .pipe(minifyCSS())
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest(DEST));
  });

gulp.task('default', gulp.series('clean', 'scripts', 'less', 'css'));