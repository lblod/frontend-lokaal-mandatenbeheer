import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class AdminPanelRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.showAdminFeatures) {
      this.router.replaceWith('index');
    }

    //TODO: remove once we have more tabs in the menu and we can create an overview page for the admin panel
    this.router.replaceWith('admin-panel.global-system-message');
  }
}
