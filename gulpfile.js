var gulp = require('gulp');
var concat = require("gulp-concat");
var minify = require("gulp-minify");
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

gulp.task('js', function () {
  return gulp.src("src/**/*.js")
	.pipe(concat("ol-labels.js"))
    .pipe(gulp.dest("./dist/"))
});

gulp.task("watch-js", function() {
  return gulp.watch("src/**/*.js", ["js"])
});

gulp.task("css", function() {
	return gulp.src("css/**/*.css")
	   .pipe(concat("ol-labels.css"))
     .pipe(gulp.dest("./dist/"))
});

gulp.task("watch-css", function() {
  return gulp.watch("css/**/*.css", ["css"])
});

gulp.task("minify-js", function(){
  return gulp.src("src/**/*.js")
	.pipe(concat("ol-labels.js"))
  .pipe(minify(
  {	ext: {
      src:".js",
      min:".min.js"
    }
  }))
  .pipe(gulp.dest("./dist/"))
})

gulp.task('minify-css', function() {
  gulp.src('css/**/*.css')
      .pipe(cssmin())
      .pipe(rename("ol-labels.min.css"))
      .pipe(gulp.dest('dist'));
});


gulp.task("watch", ["watch-js", "watch-css"]);
gulp.task("build", ["css", "minify-css", "minify-js"]);
