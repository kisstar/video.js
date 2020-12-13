import path from 'path';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import progressPlugin from 'rollup-plugin-progress';
import alias from 'rollup-plugin-alias';
import isCI from 'is-ci';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

const watch = {
  clearScreen: false
};

const onwarn = (warning) => {
  // ignore unknow option for --no-progress
  if (
    warning.code === 'UNKNOWN_OPTION' &&
    warning.message.indexOf('progress') !== -1
  ) {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(warning.message);
};

const primedResolve = resolve({
  mainFields: ['jsnext:main', 'module', 'main'],
  browser: true
});

const primedCjs = commonjs({
  sourceMap: false
});

const primedBabel = babel({
  runtimeHelpers: true,
  babelrc: false,
  exclude: 'node_modules/**(!http-streaming)',
  compact: false,
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        loose: true,
        modules: false
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-object-assign',
    ['@babel/plugin-transform-runtime', { regenerator: false }]
  ]
});

const progress = () => {
  if (isCI) {
    return {};
  }

  return progressPlugin();
};

const globals = {
  browser: {
    // prettier-ignore
    'global': 'window',
    'global/window': 'window',
    'global/document': 'document'
  },
  module: {},
  test: {
    qunit: 'QUnit',
    qunitjs: 'QUnit',
    sinon: 'sinon'
  }
};

const moduleExternals = [
  'global',
  '@videojs/xhr',
  'safe-json-parse',
  'videojs-vtt.js',
  'url-toolkit',
  'm3u8-parser',
  'mpd-parser',
  'mux.js',
  'aes-decrypter',
  'keycode',
  '@babel/runtime'
];

const externals = {
  browser: Object.keys(globals.browser).concat([]),
  module(id) {
    const result = moduleExternals.some((ext) => id.indexOf(ext) !== -1);

    return result;
  },
  test: Object.keys(globals.test).concat([])
};

export default (cliargs) => [
  // standard umd file
  {
    input: 'src/index.js',
    output: {
      format: 'umd',
      file: 'dist/video.js',
      name: 'videojs',
      globals: globals.browser
    },
    external: externals.browser,
    plugins: [
      alias({
        'video.js': path.resolve(__dirname, './src/js/video.js')
      }),
      primedResolve,
      json(),
      primedCjs,
      primedBabel,
      serve({
        contentBase: ['dist', 'public']
      }),
      livereload({
        watch: ['dist', 'public']
      }),
      cliargs.progress !== false ? progress() : {}
    ],
    onwarn,
    watch
  }
];
