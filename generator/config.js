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
    name: '@okta/samples.react.doc-signin-widget',
    type: 'doc-sample',
    useSiw: true,
    excludeAction: /^github-/,
    features: [
      'doc-signin-widget'
    ]
  },
  {
    name: '@okta/samples.react.doc-no-oidc',
    type: 'doc-sample',
    useSiw: false,
    excludeAction: /^github-/,
    features: [
      'doc-no-oidc'
    ]
  }
];
