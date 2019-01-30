const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

var nodeModules = {};
fs
  .readdirSync("node_modules")
  .filter(function(x) {
    return [".bin"].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = "commonjs " + mod;
  });

module.exports = {
  target: "node",
  entry: ["webpack/hot/poll", "./index.js"],
  devtool: "inline-source-map",
  devServer: {
    hot: true,
    open: true
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  externals: nodeModules
};
