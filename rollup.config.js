import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import pkg from "./package.json";

require('./env'); // set variables in process.env

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
];

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return id => pattern.test(id);
}

const commonPlugins = [
  replace({
    'process.env.PACKAGE_NAME': JSON.stringify(process.env.PACKAGE_NAME),
    'process.env.PACKAGE_VERSION': JSON.stringify(process.env.PACKAGE_VERSION)
  }),
  cleanup()
];

export default [
  {
    input: 'src/index.js',
    external: makeExternalPredicate(external),
    plugins: [
      babel({
        babelrc: false,
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ]
      }),
      ...commonPlugins,
      terser()
    ],
    output: {
      format: 'umd',
      file: 'dist/bundles/okta-react.umd.js',
      sourcemap: true,
      name: 'OktaReact',
      exports: 'named',
      globals: {
        'react': 'React',
        'react-router-dom': 'ReactRouterDOM',
        '@okta/okta-auth-js': 'OktaAuth'
      }
    }
  },
  {
    input: 'src/index.js',
    external: makeExternalPredicate(external),
    plugins: [
      babel({
        babelHelpers: 'runtime',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        plugins: [
          '@babel/plugin-transform-runtime'
        ]
      }),
      ...commonPlugins
    ],
    output: [
      {
        format: 'cjs',
        file: 'dist/bundles/okta-react.cjs.js',
        exports: 'named',
        sourcemap: true
      },
      {
        format: 'esm',
        file: 'dist/bundles/okta-react.esm.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  }
];
