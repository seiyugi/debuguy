'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var streamqueue = require('streamqueue');
var watch = require('gulp-watch');
var symlink = require('gulp-symlink');

var TEST_PATH = 'test/*_test.js';
// XXX: we should also lint against public/scripts/*.js,
// But there are too many errors there... SCARY!!
var JSHINT_PATH = './lib/*.js';

gulp.task('jshint', function() {
  // if we are going to lint against multiple path, just append another
  // gulp.src('another_path/*.js') in argument list of streamqueue
  return streamqueue({objectMode: true}, gulp.src(JSHINT_PATH))
    .pipe(jshint()).pipe(jshint.reporter(stylish));
});

// We always run 'jshint' before 'test'.
gulp.task('unit-test', ['jshint'], function() {
  return gulp.src([TEST_PATH], {read: false})
    .pipe(mocha({reporter: 'list'})).on('error', gutil.log);
});

// By default, we always run 'unit-test'. But 'unit-test' relies on 'jshint'
gulp.task('default', ['unit-test']);

gulp.task('watch', function() {
  watch('**/*.js', function() {
    gulp.start('unit-test');
  });
});

gulp.task('hook', function () {
    return gulp.src('.pre-commit')
        .pipe(symlink('.git/hooks/pre-commit', 'pre-commit'));
});
