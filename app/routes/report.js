import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class ReportRoute extends Route {
  queryParams = {
    showSilencedResults: {
      refreshModel: true,
    },
  };

  @service router;
  @service features;
  @service session;
  @service validatie;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.features.isEnabled('shacl-report')) {
      this.router.replaceWith('index');
    }
  }
}
