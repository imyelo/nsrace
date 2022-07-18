import gulp from 'gulp'
import chmod from 'gulp-chmod'

gulp
  .src('./dist/esm/bin/*.js')
  .pipe(
    chmod({
      execute: true,
    })
  )
  .pipe(gulp.dest('./dist/esm/bin/'))
