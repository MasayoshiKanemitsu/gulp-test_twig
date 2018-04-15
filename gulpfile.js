const gulp = require("gulp");

// [gulp-*]モジュールを一括ロード
const $ = require('gulp-load-plugins')();

//Loading plugin
const pngquant = require('imagemin-pngquant');
const autoprefixer = require('autoprefixer');
const browserSync  = require('browser-sync');
const reload = browserSync.reload;
const del = require('del');
const fs = require('fs');
const runSequence = require('run-sequence');//タスクの順番指定

//template engine
//var twig = require('gulp-twig');
//var ejs = require("gulp-ejs");

//next
//var cssnext = require('postcss-cssnext');
//var mqpacker = require('css-mqpacker');
//var flexibility  = require('postcss-flexibility');

//Path
const cssPas = "www/inc/css/";
const jsPas = "www/inc/js/";
const imgPas = "www/inc/image/";
const dest_html = "www/**/*.html"
const source = ["www/**/*"];

//Vendor Prefix
const prefixBrowsers = [
	'ie >= 9',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 9',
	'android >= 4.4',
	'bb >= 10'
];


//EJS
//gulp.task('ejs', function () {
//	return gulp.src(["src/ejs/**/*.ejs","!src/ejs/**/_*.ejs"])
//		.pipe($.plumber({
//		errorHandler: function (error) {
//			console.log(error.message);
//			this.emit('end');
//		}}))
//		.pipe($.ejs())
//		.pipe(gulp.dest("www/"))
//		.pipe($.notify('EJS => HTML'))
//		.pipe(browserSync.reload({stream:true}));
//});

//twig
gulp.task('twig', function () {
	return gulp.src(["src/twig/page/**/*.twig","!src/twig/**/_*.twig"])
		.pipe($.data(function(file){
		return JSON.parse(fs.readFileSync('src/twig/config.json'));
		}))
		.pipe($.plumber({
		errorHandler: function (error) {
			console.log(error.message);
			this.emit('end');
		}}))
		.pipe($.twig())
		.pipe($.htmlBeautify({}))
		.pipe(gulp.dest("www/"))
		.pipe($.notify('TWIG => HTML'))
		.pipe(browserSync.reload({stream:true}));
});


//Sass
gulp.task("sass", function(){
	var processors = [
		autoprefixer({
				autoprefixer: { browsers: prefixBrowsers}
		})
	];
	gulp.src("src/asset/sass/**/*.scss")
	.pipe($.plumber({
		errorHandler: $.notify.onError("Error: <%= error.message %>")
	}))
	.pipe($.sourcemaps.init())//ソースマップ初期化
	.pipe($.sass({outputStyle: 'expanded'}))  //Output style
	.pipe($.postcss(processors))
	.pipe($.sourcemaps.write("./"))//CSSと同階層に作成
	.pipe(gulp.dest(cssPas))
	.pipe($.notify('Sass => CSS'));
});

//Javascript connect
gulp.task("concat", function(){
	gulp.src("src/asset/js/parts/*.js")
		.pipe($.plumber())
		.pipe($.concat("script.js"))
		.pipe(gulp.dest("src/asset/js/"))
		.pipe($.notify('concat has done!!'));
});

//For old IE under IE9
gulp.task('oldIE', function(){
	gulp.src("src/asset/js/old-ie/*.js")
		.pipe($.plumber())
		.pipe($.concat('old-ie.min.js'))
		.pipe($.uglify())
		.pipe(gulp.dest(jsPas));
});

//Javascript compresser
gulp.task("uglify", function() {
	gulp.src(["src/asset/js/**/*.js","!src/asset/js/parts/*.js","!src/asset/js/old-ie/*.js"])
		.pipe($.plumber())
		.pipe($.uglify())
		.pipe($.rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest(jsPas))
		.pipe($.notify('uglify has done!!'));
});

//Image
gulp.task("imagemin", function() {
	return gulp.src("src/asset/image/**/*")
		.pipe($.changed('image'))
		.pipe($.imagemin())
		.pipe($.imagemin(
			[pngquant({quality: '40-70', speed: 1})]
		))
		.pipe(gulp.dest(imgPas))
		.pipe($.notify('Image Compressed!!'));
});

//del
gulp.task('del', del.bind(null,[
	cssPas,
	jsPas,
	imgPas,
	dest_html,
	//source,
]));

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
});

//watch
gulp.task('watch', function () {
	gulp.watch('src/asset/sass/**/*.scss', ['sass']);
	gulp.watch("src/asset/js/parts/*.js", ['concat']);
	gulp.watch(["src/asset/js/**/*.js","!src/asset/js/parts/*.js"],['uglify']);
	gulp.watch("src/asset/image/**/*", ['imagemin']);
	gulp.watch(["src/twig/**/*.twig","src/twig/config.json"], ['twig']);
	gulp.watch(source, reload);
});

//全体エクスポート用コマンド
gulp.task("build", function(callback) {
	return runSequence(
		"del",
		["concat","oldIE"],
		"uglify",
		["sass", "imagemin", "twig"],//並行処理
		"reload",
		callback
	);
});

//gulp.task("default", ["server"]);

gulp.task("default", function(callback){
	var init = ['del'];
	var rebuild = ['build'];
	var operation = ["server"];
	var monitor = ['watch'];
	return runSequence(
		init,
		rebuild,
		operation,
		monitor,
		callback
	);
});