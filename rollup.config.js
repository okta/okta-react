import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import ts from 'typescript';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));


const makeExternalPredicate = () => {
  const externalArr = [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
    '@okta/okta-react',
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

// Each build below needs its own `typescript()` plugin instance (with its own cacheRoot).
// Sharing a single instance across configs with different inputs confuses rollup-plugin-typescript2's
// declaration-emit bookkeeping and causes spurious "would overwrite input file" (TS5055) errors.
// The first (UMD) build below type-checks the whole `src/**/*` program (per tsconfig's `include`)
// and already produces every .d.ts file we need at `dist/bundles/types`; the later builds redirect
// their (unused) declaration output elsewhere so they can't collide with those canonical files.
const commonPlugins = (cacheRoot, emitDeclarationsTo = 'dist/bundles/types') => [
  typescript({
    typescript: ts,
    useTsconfigDeclarationDir: true,
    cacheRoot: `./node_modules/.cache/rpt2_${cacheRoot}`,
    tsconfigOverride: {
      compilerOptions: {
        rootDir: 'src',
        declarationDir: emitDeclarationsTo
      }
    }
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
    // default delimiters in @rollup/plugin-replace v3+ don't match identifiers
    // followed by ".", which breaks replacing AUTH_JS.minSupportedVersion
    delimiters: ['\\b', '\\b'],
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
      ...commonPlugins('umd'),
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
      ...commonPlugins('index', './node_modules/.cache/rpt2_index_types'),
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
  },
  {
    input: 'src/react-router-5.ts',
    external,
    plugins: [
      ...commonPlugins('react-router-5', './node_modules/.cache/rpt2_react-router-5_types'),
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
        file: 'dist/bundles/okta-react-router-5.cjs.js',
        exports: 'named',
        sourcemap: true
      },
      {
        format: 'esm',
        file: 'dist/bundles/okta-react-router-5.esm.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  },
  {
    input: 'src/react-router-6.ts',
    external,
    plugins: [
      ...commonPlugins('react-router-6', './node_modules/.cache/rpt2_react-router-6_types'),
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
        file: 'dist/bundles/okta-react-router-6.cjs.js',
        exports: 'named',
        sourcemap: true
      },
      {
        format: 'esm',
        file: 'dist/bundles/okta-react-router-6.esm.js',
        exports: 'named',
        sourcemap: true
      }
    ]
  }
];
