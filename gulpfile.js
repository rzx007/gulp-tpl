var gulp = require('gulp');
var htmltpl = require('gulp-html-tpl'); // 引用html模板
var artTemplate = require('art-template'); // 模板渲染
var concat = require('gulp-concat');        // 合并文件
var uglify = require('gulp-uglify');        // js 压缩
var babel = require('gulp-babel');
var csso = require('gulp-csso');            // css压缩
var autoprefixer = require('gulp-autoprefixer');  //自动添加css兼容后缀
var imagemin = require('gulp-imagemin');    // 图片压缩
var clean = require('gulp-clean');          // 清空文件夹
var browserSync = require('browser-sync').create(); //本地服务
var watch = require('gulp-watch'); //监听文件变化，自动刷新页面

const babelenv = require('babel-preset-env');

// html处理模板,这里还没有压缩
gulp.task('html', function () {
    return gulp.src(['./src/*.html', './src/views/*.html'])
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
        .pipe(gulp.dest('./dist'));
});

// 打包js
gulp.task('js_libs', function () {
    return gulp.src('./src/libs/js/*.js')
        .pipe(gulp.dest('./dist/js'));
});

// 压缩项目js
gulp.task('js_main', function () {
    return gulp.src(['./src/js/*.js', './src/views/*.js'])
        // .pipe(concat('main.min.js'))    // 合并文件并命名
        .pipe(babel({
            presets: [babelenv]
        }))
        .pipe(uglify())  // 压缩js
        .pipe(gulp.dest('./dist/js'));
});
// 打包css
gulp.task('css_main', function () {
    return gulp.src('./src/css/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(concat('main.min.css'))
        .pipe(csso())                   // 压缩优化css
        .pipe(gulp.dest('./dist/css'));
});
// 打包其他资源
gulp.task('images', function () {
    return gulp.src('./src/images/*.*')
        .pipe(imagemin({
            progressive: true,
        }))
        .pipe(gulp.dest('./dist/images'));
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
var watcher = gulp.watch(['./src/**/*.html'] /* 你可以在这里传一些参数或者函数 */);
watcher.on('all', function(event, path, stats) {
    gulp.task('html');	//执行html任务
    browserSync.reload()
  console.log('File ' + path + ' was ' + event + ', running tasks...');
});


gulp.task('default', gulp.series('clean', 'html', 'js_libs', 'js_main', 'browser'))