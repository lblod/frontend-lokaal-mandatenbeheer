import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class SystemNotificationsController extends Controller {
  @service router;
  @tracked sort = '-created-at';

  toggleDate = restartableTask(async (notification, modelAttribute) => {
    if (notification[modelAttribute]) {
      notification[modelAttribute] = null;
    } else {
      notification[modelAttribute] = new Date();
    }
    notification.save();
  });

  @action
  readAtText(notification) {
    if (notification.readAt) {
      return 'Markeer als niet gelezen';
    }
    return 'Markeer als gelezen';
  }

  @action
  archivedAtText(notification) {
    if (notification.archivedAt) {
      return 'Terugzetten uit archief';
    }
    return 'Archiveer';
  }

  @action
  classIsRead(notification) {
    if (notification.readAt) {
      return '';
    }

    return 'notification-tableRow--unread';
  }

  get filterUnRead() {
    return { isUnRead: true, isRead: null, isArchived: null, page: 0 };
  }

  get filterRead() {
    return { isRead: true, isArchived: null, isUnRead: null, page: 0 };
  }

  get filterArchived() {
    return { isArchived: true, isRead: null, isUnRead: null, page: 0 };
  }

  get filterAll() {
    return { isArchived: null, isRead: null, isUnRead: null, page: 0 };
  }

  @action
  activeTabClass(tabNumber) {
    if (
      !this.model.tabFilters.read &&
      !this.model.tabFilters.unread &&
      !this.model.tabFilters.archived &&
      tabNumber == 1
    ) {
      return 'active';
    }
    if (this.model.tabFilters.read && tabNumber == 3) {
      return 'active';
    }
    if (this.model.tabFilters.unread && tabNumber == 2) {
      return 'active';
    }
    if (this.model.tabFilters.archived && tabNumber == 4) {
      return 'active';
    }

    return '';
  }
}
