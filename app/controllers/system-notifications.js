import Controller from '@ember/controller';

import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';

export default class SystemNotificationsController extends Controller {
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
      return 'Markeer als niet gelezen'; // euh idk
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
}
