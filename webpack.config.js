// webpack.config.js
/**
 * Webpack configuration.
 */
const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const cssnano = require("cssnano"); // https://cssnano.co/
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// JS Directory path.
const CSS_DIR = path.resolve(__dirname, "src/css");
const BUILD_DIR = path.resolve(__dirname, "build");
const entry = {
  style: CSS_DIR + "/style.scss",
};
const output = {
  path: BUILD_DIR,
  filename: "[name].js",
};

const resolve = {
  extensions: [".ts", ".tsx", ".js"],
  fallback: {
    path: require.resolve("path-browserify"),
  },
};
/**
 * Note: argv.mode will return 'development' or 'production'.
 */
const plugins = (argv) => [
  new CleanWebpackPlugin({
    cleanStaleWebpackAssets: argv.mode === "production", // Automatically remove all unused webpack assets on rebuild, when set to true in production. ( https://www.npmjs.com/package/clean-webpack-plugin#options-and-defaults-optional )
  }),
  new MiniCssExtractPlugin({
    filename: "css/[name].css",
  }),
  new IgnoreEmitPlugin(["editor.js", "style.js", "admin_css.js"]), // Or simply: new IgnoreEmitPlugin(/^style.*\.js$/)
];
const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: [
      {
        loader: "babel-loader",
      },
    ],
  },
  {
    test: /\.scss$/,
    exclude: /node_modules/,
    use: [
      MiniCssExtractPlugin.loader,
      "css-loader",
      "postcss-loader",
      "sass-loader",
    ],
  },
  {
    test: /\.(png|jpg|svg|jpeg|gif|ico|eot|svg|ttf|woff|woff2)$/,
    use: {
      loader: "file-loader",
      options: {
        name: "[path][name].[ext]",
        publicPath: "production" === process.env.NODE_ENV ? "../" : "../../",
      },
    },
  },
];
/**
 * Since you may have to disambiguate in your webpack.config.js between development and production builds,
 * you can export a function from your webpack configuration instead of exporting an object
 *
 * @param {string} env environment ( See the environment options CLI documentation for syntax examples. https://webpack.js.org/api/cli/#environment-options )
 * @param argv options map ( This describes the options passed to webpack, with keys such as output-filename and optimize-minimize )
 * @return {{output: *, devtool: string, entry: *, optimization: {minimizer: [*, *]}, plugins: *, module: {rules: *}, externals: {jquery: string}}}
 *
 * @see https://webpack.js.org/configuration/configuration-types/#exporting-a-function
 */
module.exports = (env, argv) => ({
  entry: entry,
  output: output,
  resolve: resolve,
  /**
   * A full SourceMap is emitted as a separate file ( e.g.  main.js.map )
   * It adds a reference comment to the bundle so development tools know where to find it.
   * set this to false if you don't need it
   */
  devtool: "source-map",
  module: {
    rules: rules,
  },
  optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin({
        cssProcessor: cssnano,
      }),
    ],
  },
  plugins: plugins(argv),
});
