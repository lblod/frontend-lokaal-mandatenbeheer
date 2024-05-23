import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class SystemNotificationsRoute extends Route {
  @service currentSession;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    createdAt: { refreshModel: true },
  };

  async model(params) {
    const notifications = await this.store.query('system-notification', {
      'filter[gebruiker][:id:]': this.currentSession.user.id,
      sort: params.sort,
    });

    return {
      notifications: notifications ?? [],
      sort: params.sort,
    };
  }
}
