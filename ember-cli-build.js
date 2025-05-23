'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const customBuildConfig = {
    // Add options here
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    'ember-test-selectors': {
      strip: false,
    },
    '@appuniversum/ember-appuniversum': {
      dutchDatePickerLocalization: true,
      disableWormholeElement: true,
    },
    '@embroider/macros': {
      setOwnConfig: {
        controle: process.env.CONTROLE === 'true',
      },
    },
    sassOptions: {
      includePaths: ['node_modules/@appuniversum/ember-appuniversum'],
    },
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
  };

  // console.log(defaults);

  let app = new EmberApp(defaults, customBuildConfig);
  // Uncomment this if you want a "classic build"
  // return app.toTree();

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticInvokables: true,
    staticEmberSource: true,
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
