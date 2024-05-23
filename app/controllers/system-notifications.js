import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SystemNotificationsController extends Controller {
  @service router;
  @tracked sort = '-created-at';

  get filterUnRead() {
    return { isUnRead: true, isRead: null, isArchived: null, page: 0 };
  }

  get filterRead() {
    return { isRead: true, isArchived: null, isUnRead: null, page: 0 };
  }

  get filterArchived() {
    return { isArchived: true, isRead: null, isUnRead: null, page: 0 };
  }

  @action
  activeTabClass(tabNumber) {
    if (this.model.tabFilters.unread && tabNumber == 1) {
      return 'active';
    }
    if (this.model.tabFilters.read && tabNumber == 2) {
      return 'active';
    }
    if (this.model.tabFilters.archived && tabNumber == 3) {
      return 'active';
    }

    return '';
  }
}
