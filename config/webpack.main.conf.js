const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: {
        index: path.resolve(__dirname, '../src/main/index.ts'),
        preload: path.join(__dirname, '../src/main/preload.js'),
    },
    output: {
        path: path.resolve(__dirname, '../dist/main'),
        filename: '[name].js'
    },
    target: "electron-main", // 让webpack知道你当前是在打包electron主线程代码
    externals: {
        sharp: 'commonjs sharp' // see https://github.com/lovell/sharp/issues/2350#issuecomment-762977956
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new Dotenv({
            path: path.resolve(__dirname, '../env/', `${process.env.NODE_ENV}.env`)
        })
    ]
};