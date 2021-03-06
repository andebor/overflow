const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const grp = new GitRevisionPlugin({
  versionCommand: 'describe --always --tags --long'
});
const localApiUri = "http://localhost:8000/api";

module.exports = (env, argv) => {
  // PRODUCTION will trigger optimization and compile all css into one minified file
  const PRODUCTION = argv.mode ? argv.mode === 'production' : process.env.NODE_ENV === 'production';
  const API_BASE_URI = PRODUCTION ? "/api" : localApiUri;

  return {
    entry: "./src/app.tsx",
    mode: PRODUCTION ? 'production' : 'development',

    output: {
      filename: "app.[hash:7].js",
      path: __dirname + "/dist",
      // We need to force the script tag to use / prefix when using BrowserRouter
      // as otherwise the app.js would be fetched relative to whatever URI is
      // being directly accessed (/blog/some-article/app.js instead of /app.js)
      publicPath: "/",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
      // All extensions that should be parsed
      extensions: [".ts", ".tsx", ".js", ".json", ".svg"]
    },

    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        {
          test: /\.tsx?$/,
          loader: "ts-loader"
        },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          test: /\.js$/,
          loader: "source-map-loader",
          enforce: "pre",
        },

        // SASS / SCSS
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            PRODUCTION ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              // Set up postcss to use the autoprefixer plugin
              options: { plugins: () => [require('autoprefixer')] }
            },
            'sass-loader',
          ],
        },

        // Inline SVG files
        {
          test: /\.svg$/,
          loader: "svg-inline-loader"
        }
      ]
    },

    plugins: [
      new MiniCssExtractPlugin({
        // Dynamically support HRM and single file minified css
        filename: PRODUCTION ? '[name].[hash].css' : '[name].css',
        chunkFilename: PRODUCTION ? '[id].[hash].css' : '[id].css'
      }),
      new HtmlWebpackPlugin({
        title: "Overflow",
        template: __dirname + "/src/app.html",
        filename: "index.html"
      }),
      new webpack.DefinePlugin({
        'GIT_VERSION': JSON.stringify(grp.version()),
        'GIT_COMMITHASH': JSON.stringify(grp.commithash()),
        'GIT_BRANCH': JSON.stringify(grp.branch()),
        'BUILD_DATE': JSON.stringify(new Date().toISOString()),
        'API_BASE_URI': JSON.stringify(API_BASE_URI),
      }),
      new CopyWebpackPlugin([
        { from: __dirname + '/src/static/images', to: 'images' },
      ])
    ],

    // Optimizations are enabled when PRODUCTION is true
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true // Set to true if you want JS source maps
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  }
}
