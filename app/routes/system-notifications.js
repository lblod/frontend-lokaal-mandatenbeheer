import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class SystemNotificationsRoute extends Route {
  @service currentSession;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    createdAt: { refreshModel: true },
    isRead: { refreshModel: true },
    isUnRead: { refreshModel: true },
    isArchived: { refreshModel: true },
  };

  async model(params) {
    const filter = {
      'filter[gebruiker][:id:]': this.currentSession.user.id,
      sort: params.sort,
    };

    if (params.isRead) {
      filter['filter[:has:read-at]'] = true;
      filter['filter[:has-no:archived-at]'] = true;
    }
    if (params.isUnRead) {
      filter['filter[:has-no:read-at]'] = true;
      filter['filter[:has-no:archived-at]'] = true;
    }
    if (params.isArchived) {
      filter['filter[:has:archived-at]'] = true;
    }

    const notifications = await this.store.query('system-notification', filter);

    return {
      notifications: notifications ?? [],
      sort: params.sort,
      tabFilters: {
        read: params.isRead,
        unread: params.isUnRead,
        archived: params.isArchived,
      },
    };
  }
}
