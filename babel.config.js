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
  // Normal build uses "auto" setting
  presets.unshift(['@babel/preset-env', {
    modules: "auto"
  }]);
}

module.exports = { presets, plugins };
