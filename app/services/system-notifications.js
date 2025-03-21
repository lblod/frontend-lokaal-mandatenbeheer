import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SystemNotificationsService extends Service {
  @service store;
  @service currentSession;

  activeFilter = this.filterUnRead;

  @tracked totalUnreadNotifications = 0;

  async getNotificationsForFilter(
    activeFilter = { isUnRead: true },
    { sort = 'created-at', size = 20, page = 0 }
  ) {
    this.activeFilter = activeFilter;
    const filter = {
      'filter[:or:][:has-no:gebruiker]': true,
      'filter[:or:][gebruiker][:id:]': this.currentSession.user.id,
      sort,
      page: { size, number: page },
      include: ['linked-items', 'code'].join(','),
    };

    if (this.activeFilter.isRead) {
      filter['filter[:has:read-at]'] = true;
      filter['filter[:has-no:archived-at]'] = true;
    }
    if (this.activeFilter.isUnRead) {
      filter['filter[:has-no:read-at]'] = true;
      filter['filter[:has-no:archived-at]'] = true;
    }
    if (this.activeFilter.isArchived) {
      filter['filter[:has:archived-at]'] = true;
    }

    const notifications = await this.store.query('system-notification', filter);

    if (this.activeFilter.isUnRead) {
      this.totalUnreadNotifications = notifications.meta.count || 0;
    }

    return notifications;
  }

  get filterUnRead() {
    return { isUnRead: true, isRead: false, isArchived: false };
  }

  get filterRead() {
    return { isRead: true, isArchived: false, isUnRead: false };
  }

  get filterArchived() {
    return { isArchived: true, isRead: false, isUnRead: false };
  }
}
