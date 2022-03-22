const gulp = require('gulp');
const webpack = require('webpack-stream');
const del = require('del');
const exec = require('child_process').exec;

const mainWebpackConf = require('./config/webpack.main.conf');
const rendererWebpackConf = require('./config/webpack.renderer.conf');

function clean()
{
    return del(['dist', 'release-builds'])
}

function buildRenderer()
{
    return gulp.src('./src/renderer/index.tsx')
    .pipe(webpack(rendererWebpackConf))
    .pipe(gulp.dest('./dist/renderer'));
}

function buildMain()
{
    return gulp.src('./src/main/index.ts')
    .pipe(webpack(mainWebpackConf))
    .pipe(gulp.dest('./dist/main'));
}

function packApp()
{

    return new Promise((resolve, reject) =>
    {
        exec('electron-builder --x64 --win --config electron-builder-production.yml', function(err, stdout, stderr)
        {
            if (err)
            {
                return reject(err)
            }
            console.log(stdout)
            resolve(true)
        })
    });
}

const build = gulp.series(clean, gulp.parallel(buildRenderer, buildMain), packApp)

exports.default = build;