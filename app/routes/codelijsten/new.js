import Route from '@ember/routing/route';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CodelijstenNewRoute extends Route {
  @service store;

  model() {
    const codelijst = this.store.createRecord('concept-scheme', {
      label: '',
      createdAt: new Date(),
      isReadOnly: false,
    });

    return {
      codelijst,
    };
  }

  @action
  willTransition(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controller;
    if (!controller.isSaved && controller.canSave) {
      transition.abort();
      controller.isUnsavedChangesModalOpen = true;
      controller.savedTransition = transition;
    }
  }
}
