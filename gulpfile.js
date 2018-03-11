var gulp = require("gulp"),
config 		= require("./gulp-tasks/config.json"),
requireDir  = require("require-dir"),
imagemin 	= require("gulp-imagemin"),
chalk 		= require("chalk");
requireDir("./gulp-tasks", {recurse: true});

//default server with nodemon and watch
gulp.task("default", ["minImg"]);
