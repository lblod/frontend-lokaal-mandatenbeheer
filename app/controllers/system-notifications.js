import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';

import { restartableTask } from 'ember-concurrency';

export default class SystemNotificationsController extends Controller {
  @service router;
  @service store;
  @service currentSession;

  @tracked sort;
  @tracked isRead;
  @tracked isUnRead;
  @tracked isArchived;
  @tracked page;

  @tracked activeFilter;
  @tracked notifications;

  get filterUnRead() {
    return { isUnRead: true, isRead: false, isArchived: false };
  }

  get filterRead() {
    return { isRead: true, isArchived: false, isUnRead: false };
  }

  get filterArchived() {
    return { isArchived: true, isRead: false, isUnRead: false };
  }

  @action
  getActiveClass(action) {
    if (!this.activeFilter) {
      return '';
    }

    if (action === 'read' && this.activeFilter.isRead) {
      return 'active';
    }
    if (action === 'unread' && this.activeFilter.isUnRead) {
      return 'active';
    }
    if (action === 'archived' && this.activeFilter.isArchived) {
      return 'active';
    }

    return '';
  }

  getNotifications = restartableTask(
    async ({ isRead, isUnRead, isArchived }) => {
      this.updateNotificationCountInHeader();
      const filter = {
        'filter[:or:][:has-no:gebruiker]': true,
        'filter[:or:][gebruiker][:id:]': this.currentSession.user.id,
        sort: this.sort,
        page: { size: 20, number: this.page },
      };

      if (isRead) {
        this.activeFilter = this.filterRead;
        filter['filter[:has:read-at]'] = true;
        filter['filter[:has-no:archived-at]'] = true;
      }
      if (isUnRead) {
        this.activeFilter = this.filterUnRead;
        filter['filter[:has-no:read-at]'] = true;
        filter['filter[:has-no:archived-at]'] = true;
      }
      if (isArchived) {
        this.activeFilter = this.filterArchived;
        filter['filter[:has:archived-at]'] = true;
      }

      this.notifications = await this.store.query(
        'system-notification',
        filter
      );
    }
  );

  updateNotificationCountInHeader() {
    // const applicationController = getOwner(this).lookup(
    //   'controller:application'
    // );
    console.log(`update notificationcount in header`);
    // applicationController.setNotificationCount.perform();
  }
}
