require('./env'); // set variables in process.env

const presets = [
  '@babel/preset-react'
];
const plugins = [
  ['transform-inline-environment-variables', {
    include: [
      'PACKAGE_NAME',
      'PACKAGE_VERSION'
    ]
  }],
  ['@babel/plugin-transform-runtime']
];

if (process.env.NODE_ENV === 'test') {
  // Convert to commonJS when running in jest
  presets.unshift(['@babel/preset-env', {
    modules: 'commonjs'
  }]);
} else {
  // Normal build produces an ES module
  presets.unshift(['@babel/preset-env', {
    modules: false
  }]);
}

module.exports = { presets, plugins };
