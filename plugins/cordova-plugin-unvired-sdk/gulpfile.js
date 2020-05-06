var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;
 
gulp.task('uglify', function () {
  return pipeline(
        gulp.src('src/browser/UnviredPluginProxy.js'),
        uglify(),
        gulp.dest('dist')
  );
});

gulp.task('default', gulp.series(['uglify']));