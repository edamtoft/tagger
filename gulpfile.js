var gulp = require("gulp");
var jshint = require("gulp-jshint");
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var merge = require('merge-stream');
var concat = require('gulp-concat');

var buildDirectory = "dist";

gulp.task("default", function() {
  
  var test = gulp.src(["source/**/*.js", "!source/**/*.min.js" , "!source/system/linq.js"])
    .pipe(jshint({
      globals: {
        AssetsPath: true
      },
      esnext: true
    }))
    .pipe(jshint.reporter("default"))
    .pipe(jshint.reporter("fail"))
  
  var build = gulp.src(["source/**/*.js","!source/**/*.min.js", "!source/config.js"])
    .pipe(babel({
			presets: ["es2015"]
		}))
    .pipe(uglify())
		.pipe(gulp.dest(buildDirectory));
    
  var createRuntime = gulp.src(["libraries/require.js","source/config.js"])
    .pipe(concat("tagger.js"))
    .pipe(uglify())
		.pipe(gulp.dest(buildDirectory));
  
  return merge(test, build, createRuntime);
});