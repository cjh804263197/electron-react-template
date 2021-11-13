const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: path.resolve(__dirname, '../src/main/index.ts'),
    output: {
        path: path.resolve(__dirname, '../dist/main'),
        filename: 'index.js'
    },
    target: "electron-main", // 让webpack知道你当前是在打包electron主线程代码
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
    }
};