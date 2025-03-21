import Controller from '@ember/controller';

import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import { trackedFunction } from 'reactiveweb/function';

export default class SystemNotificationsController extends Controller {
  @service router;
  @service store;
  @service currentSession;
  @service systemNotifications;

  @tracked sort;
  @tracked page;
  @tracked activeFilter = this.systemNotifications.filterUnRead;

  getNotifications = trackedFunction(this, async () => {
    return await this.systemNotifications.getNotificationsForFilter(
      this.activeFilter,
      { sort: this.sort, page: this.page }
    );
  });

  @cached
  get notifications() {
    return this.getNotifications?.value;
  }

  @action
  showReadNotifications() {
    this.activeFilter = this.systemNotifications.filterRead;
  }
  @action
  showUnReadNotifications() {
    this.activeFilter = this.systemNotifications.filterUnRead;
  }
  @action
  showArchivedNotifications() {
    this.activeFilter = this.systemNotifications.filterArchived;
  }

  @action
  updateTable() {
    this.activeFilter = this.systemNotifications.activeFilter;
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
}
