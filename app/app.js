import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import browserUpdate from 'browser-update';
import config from './config/environment';
import './config/custom-inflector-rules';
import { setupSentry } from 'frontend-lmb/utils/sentry';
import { silenceEmptySyncRelationshipWarnings } from './utils/ember-data';

setupSentry();
silenceEmptySyncRelationshipWarnings();

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

browserUpdate({
  vs: { i: 11, f: -3, o: -3, s: -3, c: -3 },
  style: 'corner',
  l: 'nl',
  // eslint-disable-next-line camelcase
  shift_page_down: false,
});

loadInitializers(App, config.modulePrefix);
