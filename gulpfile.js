var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var webpack = require('webpack-stream');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var pump = require('pump');

var webpack_config = require('./webpack.config');

gulp.task('default', function() {
    console.log('gulp');
});

// 压缩css 文件
gulp.task('minify-css', function() {
    return gulp.src('public/app/css/*.css')
        .pipe(cleanCSS({
            debug: true
        }, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(gulp.dest('dist/app/css'));
});

gulp.task('webpack-js', function() {
    gutil.log('开始打包前端js文件');
    return gulp.src('public/app/js/app.js')
        .pipe(webpack(webpack_config))
        .pipe(gulp.dest('dist/'));
});

// 报错
gulp.task('package-and-compress-js', function() {
    gutil.log('开始打包和压缩前端js文件');
    return gulp.src('public/app/js/app.js')
        .pipe(webpack(webpack_config))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

// 从目录中读取
// gulp.src()

// 读写
// gulp.dest()

// 定义一个任务
// gulp.task()

// 监视文件
// gulp.watch()
