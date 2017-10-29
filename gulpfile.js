//Loading plugin
var gulp = require("gulp");
var sass = require("gulp-sass");	//for sass compiler
var uglify = require("gulp-uglify");// for javascript compresser
var imagemin = require('gulp-imagemin'); // for image compresser
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var autoprefixer = require('autoprefixer');
var browserSync  = require('browser-sync');
var reload = browserSync.reload;

//template engine
var twig = require('gulp-twig');
//var ejs = require("gulp-ejs");
//

var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var runSequence = require('run-sequence');//タスクの順番指定

var postcss = require('gulp-postcss');
//var cssnext = require('postcss-cssnext');
//var mqpacker = require('css-mqpacker');
//var flexibility  = require('postcss-flexibility');

//Pass
var cssPas = "www/inc/css/";
var jsPas = "www/inc/js/";
var imgPas = "www/inc/image/";
var source = ["www/**/*"];


//EJS
//gulp.task('ejs', function () {
//	return gulp.src(["src/ejs/**/*.ejs","!src/ejs/**/_*.ejs"])
//		.pipe(plumber({
//		errorHandler: function (error) {
//			console.log(error.message);
//			this.emit('end');
//		}}))
//		.pipe(ejs())
//		.pipe(gulp.dest("www/"))
//		.pipe(notify('EJS => HTML'))
//		.pipe(browserSync.reload({stream:true}));
//});

//twig
gulp.task('twig', function () {
	return gulp.src(["src/twig/page/**/*.twig","!src/twig/**/_*.twig"])
		.pipe(plumber({
		errorHandler: function (error) {
			console.log(error.message);
			this.emit('end');
		}}))
		.pipe(twig())
		.pipe(gulp.dest("www/"))
		.pipe(notify('TWIG => HTML'))
		.pipe(browserSync.reload({stream:true}));
});


//Sass
gulp.task("sass", function(){
	var processors = [
	autoprefixer()
	];
	gulp.src("src/asset/sass/**/*.scss")
	.pipe(plumber({
		errorHandler: notify.onError("Error: <%= error.message %>")
	}))
	.pipe(sourcemaps.init())//ソースマップ初期化
	.pipe(sass({outputStyle: 'expanded'}))  //Output style
	.pipe(postcss(processors))
	.pipe(sourcemaps.write("./"))//CSSと同階層に作成
	.pipe(gulp.dest(cssPas))
	.pipe(notify('Sass => CSS'));
});

//Javascript connect
gulp.task("concat", function(){
	gulp.src("src/asset/js/parts/*.js")
		.pipe(plumber())
		.pipe(concat("script.js"))
		.pipe(gulp.dest("src/asset/js/"))
		.pipe(notify('concat has done!!'));
});

//Javascript compresser
gulp.task("uglify", function() {
	gulp.src(["src/asset/js/**/*.js","!src/asset/js/parts/*.js"])
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest(jsPas))
		.pipe(notify('uglify has done!!'));
});

//Image
gulp.task("imagemin", function() {
	gulp.src("src/asset/image/**/*")
		.pipe(imagemin())
		.pipe(gulp.dest(imgPas))
		.pipe(notify('Image Compressed!!'));
});

//Browser reload
gulp.task('reload',function(){
	browserSync.reload();
});

//server
gulp.task('server', function () {
	browserSync({
		notify: true,
		server: {
			baseDir: "www"
		}
	});
	gulp.watch('src/asset/sass/**/*.scss', ['sass']);
	gulp.watch("src/asset/js/parts/*.js", ['concat']);
	gulp.watch(["src/asset/js/**/*.js","!src/asset/js/parts/*.js"],['uglify']);
	gulp.watch("src/asset/image/**/*", ['imagemin']);
	gulp.watch("src/twig/**/*.twig", ['twig']);
	gulp.watch(source, reload);
});

gulp.task("default", ["server"]);

//全体エクスポート用コマンド
gulp.task("build", function(callback) {
	return runSequence(
		"concat",
		"uglify",
		["sass", "imagemin", "twig"],//並行処理
		"reload",
		callback
	);
});