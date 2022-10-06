import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from "./package.json";


const makeExternalPredicate = () => {
  const externalArr = [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ];

  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return id => pattern.test(id);
};

const extensions = ['js', 'jsx', 'ts', 'tsx'];

const input = 'src/index.ts';
const external = makeExternalPredicate();
const commonPlugins = [
  typescript({
    // eslint-disable-next-line node/no-unpublished-require
    typescript: require('typescript'),
    useTsconfigDeclarationDir: true
  }),
  replace({
    values: {
      'PACKAGE_NAME': JSON.stringify(pkg.name),
      'PACKAGE_VERSION': JSON.stringify(pkg.version),
      'SKIP_VERSION_CHECK': '0',
      'AUTH_JS': JSON.stringify({
        minSupportedVersion: '5.3.1'
      })
    },
    preventAssignment: true
  }),
  cleanup({ 
    extensions,
    comments: 'none'
  })
];

export default [
  {
    input,
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
  {
    input: 'src/index.ts',
    external,
    plugins: [
      ...commonPlugins,
      babel({
        babelHelpers: 'runtime',
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        plugins: [
          '@babel/plugin-transform-runtime'
        ],
        extensions
      }),
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
