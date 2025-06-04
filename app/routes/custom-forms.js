import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsRoute extends Route {
  @service session;
  @service features;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (this.features.isEnabled('editable-forms') === false) {
      this.router.replaceWith('index');
    }
  }
}
