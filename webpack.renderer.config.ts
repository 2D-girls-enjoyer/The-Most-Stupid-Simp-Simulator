import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import TerserPlugin from 'terser-webpack-plugin';


rules.push({
  test: /\.css$/i,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            require('tailwindcss'),
            require('autoprefixer'),
          ],
        },
      },
    },
  ],
});

export const rendererConfig: Configuration = {
  mode: 'production',
  devtool: false,
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  optimization: {
    minimize: true,

    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2020,
          format: {
            beautify: false,
            comments: false,
          },
          mangle: {
            keep_fnames: true,
            keep_classnames: true,
          },
        },
      }),
    ],
  },
};
