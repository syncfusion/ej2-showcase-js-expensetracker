var webpackGulp = require('webpack-stream');
var webpack = require('webpack');

/**
 * Bundle all module using webpack
 */
gulp.task('bundle', function() {
    var webpackConfig = require(fs.realpathSync('./webpack.config.js'));
    return gulp.src('')
        .pipe(webpackGulp(webpackConfig, webpack))
        .pipe(gulp.dest('.'));
});

/**
 * Compile SampleBrowser Samples.
 */
gulp.task('build', ['ship-deps'], function(done) {
    if (!fs.existsSync('./styles')) {
        fs.mkdirSync('./styles');
    }
    runSequence('bundle', done);
});


gulp.task('ship-deps', function(done) {
    gulp.src(['./node_modules/@syncfusion/ej2/*.css', './node_modules/@syncfusion/ej2/dist/*{.js,.map}', './node_modules/fuse.js/dist/fuse.min.js'])
        .pipe(gulp.dest('./dist/'))
        .on('end', function() {
            done();
        });
});
