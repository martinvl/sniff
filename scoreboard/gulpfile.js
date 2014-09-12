var gulp = require('gulp');
var gulpif = require('gulp-if');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var concat = require('gulp-concat');
var browserify = require('browserify');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var uglify = require('gulp-uglify');
var ngmin = require('gulp-ngmin');
var browserSync = require('browser-sync');

var shouldMinify = false;
var shouldRestart = false;

gulp.task('default', [
    'build',
    'run'
]);

gulp.task('prod', [
    'build-prod',
    'run-prod'
]);

gulp.task('build', ['build-html', 'build-css', 'build-js']);
gulp.task('build-prod', function () {
    shouldMinify = true;
    gulp.start('build');
});

gulp.task('run', ['run-backend', 'browser-sync', 'watchfront']);
gulp.task('run-prod', function () {
    shouldRestart = true;
    gulp.start('run-backend');
});

// building tasks
gulp.task('build-html', function() {
  gulp.src('./frontend/html/**/*.html')
    .pipe(gulpif(shouldMinify, minifyHTML({empty: true})))
    .pipe(gulp.dest('./frontend/build'));
});

gulp.task('build-css', function() {
  gulp.src('./frontend/css/**/*.css')
    .pipe(concat('bundle.css'))
    .pipe(gulpif(shouldMinify, minifyCSS()))
    .pipe(gulp.dest('./frontend/build/css'));
});

gulp.task('build-js', ['lint-js'], function() {
    return browserify('./frontend/js/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulpif(shouldMinify, streamify(ngmin())))
        .pipe(gulpif(shouldMinify, streamify(uglify())))
        .pipe(gulp.dest('./frontend/build/js'));
});

gulp.task('lint-js', function() {
    return gulp.src(['backend/**/*.js', 'frontend/js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// run tasks
gulp.task('watchfront', function() {
    gulp.watch([
        'frontend/js/**/*.js'
    ], ['build-js']);
    gulp.watch([
        'frontend/css/**/*.css'
    ], ['build-css']);
    gulp.watch([
        'frontend/html/**/*.html'
    ], ['build-html']);
});

gulp.task('run-backend', function (cb) {
    var files = [
        'backend/**/*.js'
    ];

    return nodemon({
        verbose: true,
        restartable: shouldRestart ? 'rs': '',
        script: 'backend/app.js',
        watch: files
    }).once('start', function () {
        setTimeout(cb, 1000);
    }).on('start', browserSync.reload);
});

gulp.task('browser-sync', ['build-html', 'build-css', 'build-js', 'run-backend'], function() {
    browserSync.init(null, {
        proxy: "http://localhost:5000",
        files: ["frontend/build/**/*.*"],
        browser: "google chrome",
        port: 7000,
    });
});
