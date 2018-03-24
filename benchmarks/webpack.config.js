const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './app.ts',
  devtool: "inline-source-map",
  mode: 'development',
	watch: false,         // overridden by webpack-dev-server
	resolve: {
		extensions: [
			'.ts', '.js'
		],
		plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })]
	},
	output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'build')
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader'
				}
      },
      {
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					query: {
						presets: ['es2015']
					}
				}
			},
		]
  },
  plugins: [
    new HtmlWebpackPlugin({
			template: 'app.html',
			inject: false
		})
  ],
	devServer: {
		compress: true,
		host: '127.0.0.1',
		port: 19223,
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	}
};
