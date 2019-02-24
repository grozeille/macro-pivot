const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  module: {
    rules: []
  },
  plugins: [
    new MonacoWebpackPlugin(webpack)
  ]
};