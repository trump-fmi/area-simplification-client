const gulp = require('gulp');
const merge = require('merge-stream');
const concat = require("gulp-concat");
const minify = require("gulp-minify");
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const ts = require("gulp-typescript");

const js = done => {
    return gulp.src("src/**/*.js")
        .pipe(concat("ol-labels.js"))
        .pipe(gulp.dest("dist/"));
};

const watchjs = done => {
    return gulp.watch("src/**/*.js", gulp.series(js))
};

const css = done => {
    return gulp.src("css/**/*.css")
        .pipe(concat("ol-labels.css"))
        .pipe(gulp.dest("dist/"));
};

const watchcss = done => {
    return gulp.watch("css/**/*.css", gulp.series(css));
};

const prepareJS = done => {
    var mainFile = gulp.src("src/main.js")
        .pipe(gulp.dest("dist/"));

    var jsFiles = gulp.src(["src/**/*.js", "!src/main.js"]);

    var tsProject = ts.createProject('tsconfig.json');
    var tsFiles = tsProject.src()
        .pipe(tsProject());

    return merge(jsFiles, tsFiles)
        .pipe(concat("ol-labels.js"))
        .pipe(minify(
            {
                ext: {
                    src: ".js",
                    min: ".min.js"
                }
            }
        ))
        .pipe(gulp.dest("dist/"));
};

const prepareCSS = done => {
    return gulp.src('css/**/*.css')
        .pipe(cssmin())
        .pipe(rename("ol-labels.min.css"))
        .pipe(gulp.dest('dist/'));
};

gulp.task("watch", gulp.parallel(watchjs, watchcss));
gulp.task("build", gulp.series(css, prepareCSS, prepareJS));
