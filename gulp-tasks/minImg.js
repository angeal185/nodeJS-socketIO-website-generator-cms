var gulp = require("gulp");
var imagemin 	= require("gulp-imagemin");

// Task to minify images into build
gulp.task("minImg", function() {
	gulp.src("./admin/public/images/*/**")
		.pipe(imagemin({
		progressive: true
		}))
		.pipe(gulp.dest("./admin/public/images/"));
});
