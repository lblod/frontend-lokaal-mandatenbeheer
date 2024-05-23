import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class SystemNotificationRowComponent extends Component {
  @tracked isHidden;

  toggleDate = restartableTask(async (notification, modelAttribute) => {
    if (notification[modelAttribute]) {
      notification[modelAttribute] = null;
    } else {
      notification[modelAttribute] = new Date();
    }
    await notification.save();
    this.isHidden = true;
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
}
