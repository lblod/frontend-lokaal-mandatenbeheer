import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class CustomFormsInstancesRoute extends Route {
  @service store;
  @service session;
  @service semanticFormRepository;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model({ id }) {
    const form = await this.store.findRecord('form', id);

    return {
      form,
    };
  }
}
