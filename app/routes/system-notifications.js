import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class SystemNotificationsRoute extends Route {
  @service currentSession;
  @service session;
  @service store;
  @service router;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (this.currentSession.isLokaalBeheerd) {
      this.router.transitionTo('lokaal-beheerd');
    }
  }

  model(params) {
    return {
      userId: this.currentSession.user.id,
      sort: params.sort,
    };
  }

  setupController(controller) {
    let filter = controller.activeFilter;
    if (!filter) {
      filter = controller.filterUnRead;
    }
    controller.getNotifications.perform(filter);
  }
}
