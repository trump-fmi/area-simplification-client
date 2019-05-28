var gulp = require('gulp');
var concat = require("gulp-concat");
var minify = require("gulp-minify");
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

const js = done => {
	return gulp.src("src/**/*.js")
		.pipe(concat("ol-labels.js"))
		.pipe(gulp.dest("dist/"));
};

const watchjs = done => {
	return gulp.watch("src/**/*.js", gulp.series(js))
}

const css = done => {
	return gulp.src("css/**/*.css")
		.pipe(concat("ol-labels.css"))
		.pipe(gulp.dest("dist/"));
};

const watchcss = done => {
	return gulp.watch("css/**/*.css", gulp.series(css));
};

const minifyjs = done => {
	return gulp.src("src/**/*.js")
		.pipe(minify(
			{ext: {
				src:".js",
				min:".min.js"
			}}
		))
		.pipe(concat("ol-labels.js"))
		.pipe(gulp.dest("dist/"));
};

const minifycss = done => {
	return gulp.src('css/**/*.css')
		.pipe(cssmin())
		.pipe(rename("ol-labels.min.css"))
		.pipe(gulp.dest('dist/'));
};

gulp.task("watch", gulp.parallel(watchjs, watchcss));
gulp.task("build", gulp.series(css, minifycss, minifyjs));
