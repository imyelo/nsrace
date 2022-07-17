import gulp from 'gulp'
import chmod from 'gulp-chmod'

gulp
  .src('./lib/bin/*.js')
  .pipe(
    chmod({
      execute: true,
    })
  )
  .pipe(gulp.dest('./lib/bin/'))
