const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development'

const config = {
    mode: process.env.NODE_ENV,
    entry: {
        app: path.resolve(__dirname, '../src/renderer/index.tsx')
    },
    target: ['web', 'electron-renderer'],
    externals: {
        electron: 'electron'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    },
    output: {
        path: path.resolve(__dirname, '../dist/renderer'),
        filename: isDev ? 'renderer.dev.js' : 'app.bundle.js',
        publicPath: '.'
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
            // {
            //     test: /\.s?css$/,
            //     use: [
            //     'style-loader',
            //     {
            //         loader: 'css-loader',
            //         options: {
            //         modules: true,
            //         sourceMap: true,
            //         importLoaders: 1,
            //         },
            //     },
            //     'sass-loader',
            //     ],
            //     include: /\.module\.s?(c|a)ss$/,
            //     exclude: /node_modules/
            // },
            // {
            //     test: /\.s?css$/,
            //     use: ['style-loader', 'css-loader', 'sass-loader'],
            //     exclude: [/\.module\.s?(c|a)ss$/, /node_modules/],
            // }
            {
				test: /\.scss$/,
				exclude: [/node_modules/],
				oneOf: [
					{
						test: /\.module\.scss$/,
						use: [
							'style-loader',
							{
								loader: "css-loader",
								options: {
									modules: {
										localIdentName:
											"[path][name]__[local]--[hash:base64:5]",
									},
									// sourceMap: DEV,
								},
							},
							{
								loader: "sass-loader",
								options: {
									// sourceMap: DEV,
								},
							},
						],
					},
					{
						use: [
							'style-loader',
							{
								loader: "css-loader",
								options: {
									// sourceMap: DEV,
								},
							},
							{
								loader: "sass-loader",
								options: {
									// sourceMap: DEV,
								},
							},
						],
					},
				],
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, '../public/index.ejs'),
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
            },
            isBrowser: false,
            isDevelopment: isDev,
        }),
    ]
}

if (isDev)
{
    config.devServer = {
        port: 3002,
        compress: true,
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        historyApiFallback: {
          verbose: true,
          disableDotRule: false,
        },
    }
}

module.exports = config