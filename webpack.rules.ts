import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: "swc-loader",
      options: {
        jsc: {
          target: "es2022",
          minify:{
            compress: true,
            mangle: {
              topLevel: true,
            },
          },
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
          },
          transform: {
            optimizer: {
              globals: {
                vars: {
                  DEBUG: "true",
                },
              },
            },
          },
        },
        module: {
          type: "es6",
        },
      },
    },
  },
];
