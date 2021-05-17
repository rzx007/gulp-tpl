var gulp = require('gulp');
var htmltpl = require('gulp-html-tpl'); // 引用html模板
var artTemplate = require('art-template'); // 模板渲染
var concat = require('gulp-concat');        // 合并文件
var htmlmin = require('gulp-htmlmin');      // html压缩
var uglify = require('gulp-uglify');        // js 压缩
var babel = require('gulp-babel');           //编译es6语法
var browserify = require('gulp-browserify'); //借助browserify你可以使编译require, module.exports功能
var stringify = require('stringify');          //require("./hello.html") 
var csso = require('gulp-csso');            // css压缩
var autoprefixer = require('gulp-autoprefixer');  //自动添加css兼容后缀
var imagemin = require('gulp-imagemin');    // 图片压缩
var cache = require('gulp-cache'); //缓存
var clean = require('gulp-clean');          // 清空文件夹
var browserSync = require('browser-sync').create(); //本地服务
var gulpif = require('gulp-if');            // 条件判断
// const babelenv = require('babel-preset-env');

// 区分生产开发环境
process.env.NODE_ENV = 'development'
function build() {
    return process.env.NODE_ENV === 'production'
}

// 路径
var packPath = {
    html: ['./src/*.html', './src/views/*.html','./src/views/**/*.html'],
    jsLibs: ['./src/libs/**/*'],
    jsMain: ['./src/js/*.js', './src/views/*.js','./src/views/**/*.js'],
    cssMian: ['./src/css/**/*.css', './src/css/*.css'],
    images: ['./src/assets/*']
}

// html处理模板,这里还没有压缩
gulp.task('html', function () {
    return gulp.src(packPath.html)
        .pipe(htmltpl({
            tag: 'template',
            paths: ['./src/components'],
            engine: function (template, data) {
                return template && artTemplate.compile(template)(data);
            },
            data: { //初始化数据
                header: false,
                g2: false
            }
        }))
        .pipe(gulpif(build(), htmlmin({
            removeComments: true,       // 清除HTML注释
            collapseWhitespace: true,   // 压缩HTML
            minifyJS: true,             // 压缩页面JS
            minifyCSS: true             // 压缩页面CSS
        })))
        .pipe(gulp.dest('./dist'));
});

// 打包js
gulp.task('js_libs', function () {
    return gulp.src(packPath.jsLibs)
        .pipe(gulp.dest('./dist/libs'));
});
// 压缩项目js
gulp.task('js_main', function () {
    return gulp.src(packPath.jsMain)
        .pipe(babel())
        .pipe(browserify({
            debug: !build(),
            transform: [
                stringify(['.html']),
            ],
        }))
         .pipe(concat('main.min.js'))    // 合并文件并命名
        .pipe(gulpif(build(), uglify()))  // 压缩js
        .pipe(gulp.dest('./dist/js'));
});
// 打包css
gulp.task('css_main', function () {
    return gulp.src(packPath.cssMian)
        .pipe(autoprefixer())
        .pipe(concat('main.min.css'))
        .pipe(gulpif(build(), csso()))                   // 压缩优化css
        .pipe(gulp.dest('./dist/css'));
});
// 打包其他资源
gulp.task('images', function () {
    return gulp.src(packPath.images)
        .pipe(gulpif(build(), cache(imagemin({
            optimizationLevel: 5, // 取值范围：0-7（优化等级），默认：3  
            progressive: true, 	// 无损压缩jpg图片，默认：false 
            interlaced: true, 	// 隔行扫描gif进行渲染，默认：false 
            multipass: true 		// 多次优化svg直到完全优化，默认：false 
        }))))
        .pipe(gulp.dest('./dist/assets'));
});
// 清空dist文件夹
gulp.task('clean', function () {
    return gulp.src(['./dist/*'])
        .pipe(clean());
});

gulp.task('browser', function () {
    browserSync.init({
        server: './dist'    // 访问目录
        // proxy: "你的域名或IP"    // 设置代理
    });
});
// 开发环境，生产环境
gulp.task('production', function (cb) {
    process.env.NODE_ENV = 'production';
    cb()
})
gulp.task('development', function (cb) {
    process.env.NODE_ENV = 'development'
    cb()
})
function watchs() {
    var watcher = gulp.watch([].concat(packPath.html, packPath.jsMain, packPath.cssMian, packPath.jsLibs, packPath.images), gulp.series('clean', 'html', 'css_main', 'images', 'js_libs', 'js_main'));
    watcher.on('all', function (event, path, stats) {
        browserSync.reload()
        console.log('File ' + path + ' was ' + event + ', running tasks...');
    });
}
if(!build()) watchs()



gulp.task('build', gulp.series('production', 'clean', 'html', 'css_main', 'images', 'js_libs', 'js_main'))

gulp.task('dev', gulp.series('development', 'clean', 'html', 'css_main', 'images', 'js_libs', 'js_main', 'browser'))

