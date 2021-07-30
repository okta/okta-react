module.exports = [
  {
    name: '@okta/samples.react.okta-hosted-login',
    type: 'github-sample',
    useSiw: false,
    excludeAction: /^doc-/,
    specs: [
      'okta-hosted-login'
    ]
  },
  {
    name: '@okta/samples.react.custom-login',
    type: 'github-sample',
    useSiw: true,
    excludeAction: /^doc-/,
    specs: [
      'custom-login'
    ]
  },
  {
    name: '@okta/samples.react.doc-embedded-widget',
    type: 'doc-sample',
    useSiw: true,
    excludeAction: /^github-/,
    specs: [
      'doc-embedded-widget'
    ]
  },
  {
    name: '@okta/samples.react.doc-direct-auth',
    type: 'doc-sample',
    useSiw: false,
    excludeAction: /^github-/,
    specs: [
      'doc-direct-auth'
    ]
  }
];
