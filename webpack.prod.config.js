const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const Dotenv = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')

const extractCSS = new ExtractTextPlugin('bundle-[name].css')

const ENV_DIR = './config/'
const envPath = ENV_DIR + `${process.env.NODE_ENV}`.toLowerCase() + '.env'

module.exports = {
  devtool: 'source-map',
  mode: 'production',
  entry: {
    main: ['@babel/polyfill', path.resolve(__dirname, 'src/index.js')],
    popup: ['@babel/polyfill', path.resolve(__dirname, 'public/app/scripts/ui/popup-index.js')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle-[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              // options: { minimize: true },
            },
          ],
        })
      },
      {
        test: /\.scss$/,
        use: extractCSS.extract({
          use: [
            {
              loader: 'css-loader',
              // options: { minimize: true },
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [path.resolve(__dirname, 'src/styles')],
              },
            },
          ],
        }),
      },
    ],
  },
  resolve: {
    alias: {
      constants: path.resolve(__dirname, 'src/constants/'),
      components: path.resolve(__dirname, 'src/components/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      contracts: path.resolve(__dirname, 'contracts'),
      reducers: path.resolve(__dirname, 'src/reducers/'),
      actions: path.resolve(__dirname, 'src/actions'),
      images: path.resolve(__dirname, 'static/images/'),
      pages: path.resolve(__dirname, 'src/pages/'),
      iostJS: path.resolve(__dirname, 'src/iost/'),
    },
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
      }),
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      inject: 'body',
      chunks: ['main'],
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/askTx.html'),
      inject: 'body',
      chunks: ['popup'],
      filename: 'askTx.html',
    }),
    extractCSS,
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.NoEmitOnErrorsPlugin(),
    new CompressionPlugin(),
    new CopyWebpackPlugin([{
      from: 'static',
      to: 'static',
      toType: 'dir',
    },
    { from: 'public/manifest.json' },
    { from: 'public/assets', to: 'assets', toType: 'dir' },
    { from: 'public/app', to: 'app', toType: 'dir' },
  ]),
    new Dotenv({
      path: envPath,
    }),
  ],
}
