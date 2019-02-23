const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

module.exports = {
  module: {
    rules: []
  },
  plugins: [
    new MonacoWebpackPlugin(webpack)
  ]
};