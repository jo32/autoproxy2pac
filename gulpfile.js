var gulp = require('gulp');
var babel = require('gulp-babel');
var insert = require('gulp-insert');

gulp.task('default', function() {
    gulp.src('./src/**/*.js')
        .pipe(babel({
        optional: ['runtime']
    }))
        .pipe(insert.prepend('#!/usr/bin/env node\n'))
        .pipe(gulp.dest('./build'));
});