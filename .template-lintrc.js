'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  overrides: [
    {
      files: ['tests/**/*-test.*'],
      rules: {
        'require-input-label': false,
      },
    },
    {
      // TODO: lmb-1331
      files: ['app/templates/**/*.hbs'],
      rules: {
        'no-at-ember-render-modifiers': false, // Makes it possible to use {{did-insert}} && {{did-update}} modifiers in template
      },
    },
  ],
};
