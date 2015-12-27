'use strict';

var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");

var outDir = './release/manga-downloader'

gulp.task('bower', function () {
    return gulp.src(mainBowerFiles('**/*.js'))
        .pipe(gulp.dest(outDir));
});

gulp.task('content', function () {
    return gulp.src(['src/*.*', '!src/*.ts', 'icons/*'])
        .pipe(gulp.dest(outDir));
});

var compiler = webpack(Object.create(webpackConfig));
gulp.task("webpack", function (callback) {
    compiler.run(callback);
});

gulp.task('default', ['webpack', 'content', 'bower']);
gulp.task('watch', ['default'], function () {
    gulp.watch('src/**/*.ts', ['webpack']);
    gulp.watch(['src/*.*', '!src/*.ts', 'icons/*'], ['content']);
});