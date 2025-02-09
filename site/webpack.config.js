const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: ["./index.js", "./style.css"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  mode: "development",
  experiments: {
    asyncWebAssembly: true,
  },
  resolve: {
    extensions: [".wasm", ".js", ".html", ".css", ".csv"],
  },
  module: {
    rules: [
      {
        test: /\.css?$/,
        use: [{ loader: "raw-loader", options: { esModule: false } }],
      },
      {
        test: /\.csv?$/,
        use: [{ loader: "raw-loader", options: { esModule: false } }],
      },
      {
        test: /\.wasm?$/,
        type: "webassembly/async",
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "index.html" },
        { from: "style.css" },
        { from: "umap_coordinates.csv" },
      ],
    }),
  ],
};
