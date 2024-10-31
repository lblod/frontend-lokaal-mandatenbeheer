import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class FormRoute extends Route {
  @service store;
  @service router;
  @service session;
  @service semanticFormRepository;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model({ id: semanticFormID }) {
    const definition =
      await this.semanticFormRepository.getFormDefinition(semanticFormID);

    return definition;
  }
}
