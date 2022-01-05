const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const purgecss = require('gulp-purgecss');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');
const sourcemaps = require('gulp-sourcemaps');
const htmlPartial = require('gulp-html-partial');
const clean = require('gulp-clean');
const htmlPartial = require('gulp-html-partial');
const isProd = process.env.NODE_ENV === 'prod';

const htmlFiles = [
    './src/**/*.html'
];

const cssFiles = [
    './src/assets/scss/**/*.scss',
    './src/assets/css/**/*.css'
];

function html() {
    return gulp.src(htmlFiles)
        .pipe(htmlPartial(
            {
                basePath: './src/partials/'
            }
        ))
        .pipe(gulpIf(isProd, htmlmin(
            {
                collapseWhitespace: true
            }
        )))
        .pipe(gulp.dest('./dist'));
}

function css() {
    return gulp.src(cssFiles)
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass({
            includePaths: ['node_modules'],
            // outputStyle: 'expanded'
        })).on('error', sass.logError)
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulpIf(isProd, cssmin()))
        .pipe(gulpIf(isProd, purgecss({ content: htmlFiles })))
        .pipe(gulp.dest('./dist/css/'));
}

function js() {
    return gulp.src('./src/assets/js/**/*.js')
        .pipe(jsImport({
            hideConsole: true
        }))
        .pipe(gulpIf(isProd, concat('all.js')))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest('./dist/js/'));
}

function img() {
    return gulp.src('./src/assets/images/*')
        .pipe(gulpIf(isProd, imagemin()))
        .pipe(gulp.dest('./dist/images/'));
}

function serve() {
    browserSync.init({
        open: true,
        server: './dist'
    });
}

function browserSyncReload(done) {
    browserSync.reload();
    done();
}

function watchFiles() {
    gulp.watch('./src/**/*.html', gulp.series(html, browserSyncReload));
    gulp.watch('./src/**/*.' + /\.(s[ac]|c)ss$/i, gulp.series(css, browserSyncReload));
    gulp.watch('./src/**/*.js', gulp.series(js, browserSyncReload));
    gulp.watch('./src/assets/images/**/*.*', gulp.series(img));

    return;
}

function del() {
    return gulp.src('./dist/*', { read: false })
        .pipe(clean());
}

exports.css = css;
exports.html = html;
exports.js = js;
exports.del = del;
exports.serve = gulp.parallel(html, css, js, img, watchFiles, serve);
exports.default = gulp.series(del, html, css, js, img);