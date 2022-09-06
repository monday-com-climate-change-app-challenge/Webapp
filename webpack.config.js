const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

require("dotenv").config();

module.exports = {
  mode: "production",
  devServer: {
    contentBase: "./dist",
  },
  entry: {
    main: "./src/js/index.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Import your Dataset(CSV) for Data Analysis/Visualization of Carbon emissions/green house gases",
      template: "./src/index.html",
      apiKey: process.env.API_KEY,
      minify: {
        collapseWhitespace: true,
      },
    }),
  ],
};
