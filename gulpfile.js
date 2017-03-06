const gulp = require('gulp')
const sass = require('gulp-sass')

gulp.task('sass', () => {
  return gulp.src('./app/styles/sass/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./app/styles'))
})

gulp.task('sass:watch', () => {
  gulp.watch('./app/styles/sass/*.scss', ['sass'])
})

gulp.task('default', ['sass', 'sass:watch'])
