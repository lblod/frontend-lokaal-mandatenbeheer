'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-at-ember-render-modifiers': false, // Makes it possible to use {{did-insert}} && {{did-update}} modifiers in template
  },
  overrides: [
    {
      files: ['tests/**/*-test.*'],
      rules: {
        'require-input-label': false,
      },
    },
  ],
};
