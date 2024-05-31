import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from "./package.json";


const extensions = ['js', 'jsx', 'ts', 'tsx'];

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
];

const commonPlugins = [
  typescript({
    // eslint-disable-next-line node/no-unpublished-require
    typescript: require('typescript'),
    useTsconfigDeclarationDir: true
  }),
  replace({
    values: {
      'PACKAGE_NAME': JSON.stringify(pkg.name),
      'PACKAGE_VERSION': JSON.stringify(pkg.version)
    },
    preventAssignment: true
  }),
  cleanup({ 
    extensions,
    comments: 'none'
  })
];

export default [
  // UMD Core (Only) Bundle
  {
    input: 'src/index.ts',
    external,
    plugins: [
      ...commonPlugins,
      babel({
        babelrc: false,
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        extensions
      }),
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
  // CJS and ESM Core Bundle
  {
    input: 'src/index.ts',
    external,
    plugins: [
      ...commonPlugins,
      babel({
        // babelHelpers: 'runtime',
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        // plugins: [
        //   '@babel/plugin-transform-runtime'
        // ],
        extensions
      }),
    ],
    output: [
      {
        format: 'cjs',
        file: 'dist/bundles/cjs/okta-react.js',
        exports: 'named',
        sourcemap: true
      },
      {
        format: 'esm',
        file: 'dist/bundles/esm/okta-react.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  },
  // CJS and ESM RouterV5 Bundle
  {
    input: 'src/router-v5/index.ts',
    external: [...external, '@okta/okta-react'],
    plugins: [
      ...commonPlugins,
      babel({
        // babelHelpers: 'runtime',
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        // plugins: [
        //   '@babel/plugin-transform-runtime'
        // ],
        extensions
      }),
    ],
    output: [
      {
        format: 'cjs',
        file: 'dist/bundles/cjs/router-v5.js',
        exports: 'named',
        sourcemap: true
      },
      {
        format: 'esm',
        file: 'dist/bundles/esm/router-v5.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  },
  // CJS and ESM RouterV6 Bundle
  {
    input: 'src/router-v6/index.ts',
    external: [...external, '@okta/okta-react'],
    plugins: [
      ...commonPlugins,
      babel({
        // babelHelpers: 'runtime',
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        // plugins: [
        //   '@babel/plugin-transform-runtime'
        // ],
        extensions
      }),
    ],
    output: [
      {
        format: 'cjs',
        file: 'dist/bundles/cjs/router-v6.js',
        exports: 'named',
        sourcemap: true
      },
      {
        format: 'esm',
        file: 'dist/bundles/esm/router-v6.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  }
];
