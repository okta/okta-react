const presets = [
  '@babel/preset-react'
];
const plugins = [];

if (process.env.NODE_ENV === 'test') {
  // Convert to commonJS when running in jest
  presets.unshift(['@babel/preset-env', {
    modules: 'commonjs'
  }]);
}

module.exports = { presets, plugins };
