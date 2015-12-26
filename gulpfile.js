'use strict';

var gulp = require('gulp');
var tsd = require('gulp-tsd');
var clean = require('gulp-clean');
var bower = require('gulp-bower');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var flatten = require('gulp-flatten');
var gulpFilter = require('gulp-filter');
var sourcemaps = require('gulp-sourcemaps');
var mainBowerFiles = require('main-bower-files');

var outDir = './release/manga-downloader'

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

gulp.task('bower', function () {
    return bower();
});

gulp.task('clean', function () {
    return gulp.src(outDir + '/*', { read: false })
        .pipe(clean());
});

gulp.task('bower-files', function () {
    return gulp.src(mainBowerFiles())
        .pipe(flatten())
        .pipe(gulp.dest(outDir));
});

var proj = ts.createProject('tsconfig.json');
gulp.task('script', function () {
    var mangaFilter = gulpFilter(['manga.*', 'utils.*', 'parsers/**'], { restore: true });

    var files = gulp.src(['typings/**/*.d.ts', 'src/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(ts(proj));

    return files.js
        .pipe(mangaFilter)
        .pipe(concat('manga.js'))
        .pipe(mangaFilter.restore)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outDir));
});

gulp.task('content', function () {
    return gulp.src(['src/*.*', '!src/*.ts', 'icons/*'])
        .pipe(gulp.dest(outDir));
});

gulp.task('install', ['bower', 'tsd']);
gulp.task('default', ['script', 'content', 'bower-files']);
gulp.task('watch', ['default'], function () {
    gulp.watch('src/**/*.ts', ['script']);
    gulp.watch(['src/*.*', '!src/*.ts', 'icons/*'], ['content']);
});