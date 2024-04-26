import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import browserUpdate from 'browser-update';
import config from './config/environment';
import './config/custom-inflector-rules';
import { setupSentry } from 'frontend-lmb/utils/sentry';
import { silenceEmptySyncRelationshipWarnings } from './utils/ember-data';
import Model from '@ember-data/model';

setupSentry();
silenceEmptySyncRelationshipWarnings();

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

// if we track modified state in the model, add the current time as modified date
Model.reopen({
  save: function () {
    if (this.constructor.attributes.get('modified')) {
      this.modified = new Date();
    }
    return this._super();
  },
});

// By default `Array.prototype._super` is enumerable which causes conflicts with rdflib.
// We can force it to be non-enumerable so everything works as expected.
// This code can be removed once the bug is fixed and released, or if we disable the prototype extensions in the app.
// More information: https://github.com/emberjs/ember.js/issues/19289
Object.defineProperty(Array.prototype, '_super', {
  enumerable: false,
});

browserUpdate({
  vs: { i: 11, f: -3, o: -3, s: -3, c: -3 },
  style: 'corner',
  l: 'nl',
  // eslint-disable-next-line camelcase
  shift_page_down: false,
});

loadInitializers(App, config.modulePrefix);
