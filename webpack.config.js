const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    shared: [
      'picoapp',
    ],

    app: {
      import: path.join(__dirname, 'resources/app.js'),
      dependOn: 'shared',
    },

    global: {
      import: path.join(__dirname, 'resources/global.js'),
      dependOn: 'app',
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],

  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'src/assets'),
  },

  resolve: {
    alias: {
      '~': path.join(__dirname, 'node_modules'),
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false },
          },
          'postcss-loader',
        ],
      },
    ],
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),

      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],

    splitChunks: {
      cacheGroups: {
        polyfills: {
          test: /[\\/]node_modules[\\/](@babel|core-js|regenerator-runtime)[\\/]/,
          name: 'polyfills',
          chunks: 'initial',
          priority: 60,
          enforce: true,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
