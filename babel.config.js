module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '60',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
      },
    ],
    [
      'react-intl',
      {
        idInterpolationPattern: '[sha512:contenthash:base64:6]',
        extractFromFormatMessageCall: true,
        ast: true,
      },
    ],
    [
      'transform-imports',
      {
        lodash: {
          transform: 'lodash/${member}',
          preventFullImport: true,
        },
        'react-virtualized': {
          transform: 'react-virtualized/dist/es/${member}',
          preventFullImport: true,
        },
        'dom-helpers': {
          transform: 'dom-helpers/esm/${member}',
          preventFullImport: true,
        },
      },
    ],
  ],
};
