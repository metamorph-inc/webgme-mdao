var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  context: __dirname + '/src/visualizers',
  devtool: debug ? "inline-sourcemap" : "source-map",
  entry: "./panels/Dataflow/DataflowPanelEntry.js",
  output: {
    path: __dirname + "/src",
    filename: "./visualizers/panels/Dataflow/DataflowPanel.js",
	libraryTarget: "amd",
    //sourceMapFilename: 'DataflowPanel.map',
  },
  plugins: debug ? [] : [
    new UglifyJsPlugin({ mangle: true, sourceMap: true }),
  ],

module: {
  rules: [
    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
  ]
},

externals: {
  'js/NodePropertyNames': 'js/NodePropertyNames',
  'js/Constants': 'js/Constants',
  'js/Utils/GMEConcepts': 'js/Utils/GMEConcepts',
  'js/PanelManager/IActivePanel': 'js/PanelManager/IActivePanel',
  'js/PanelBase/PanelBaseWithHeader': 'js/PanelBase/PanelBaseWithHeader',

  'css!../../widgets/Dataflow/styles/DataflowWidget.css': 'css!../../widgets/Dataflow/styles/DataflowWidget.css'
}

};
