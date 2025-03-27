import Route from '@ember/routing/route';

import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CustomFormsNewRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  @action
  willTransition(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controller;
    if (
      !controller.isCreated &&
      (controller.isValidName || controller.description)
    ) {
      transition.abort();
      controller.isUnsavedChangesModalOpen = true;
      controller.savedTransition = transition;
    }
  }
}
