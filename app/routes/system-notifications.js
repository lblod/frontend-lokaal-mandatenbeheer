import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class SystemNotificationsRoute extends Route {
  @service currentSession;
  @service session;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
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
