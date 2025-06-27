import Component from '@glimmer/component';

import { restartableTask } from 'ember-concurrency';

export default class SystemNotificationRowComponent extends Component {
  toggleDate = restartableTask(async (modelAttribute) => {
    if (this.args.notification[modelAttribute]) {
      this.args.notification[modelAttribute] = null;
    } else {
      this.args.notification[modelAttribute] = new Date();
    }
    await this.args.notification.save();

    this.args.updateTable();
  });

  get readAtText() {
    if (this.args.notification.readAt) {
      return 'Markeer als niet gelezen';
    }
    return 'Markeer als gelezen';
  }

  get archivedAtText() {
    if (this.args.notification.archivedAt) {
      return 'Terugzetten uit archief';
    }
    return 'Archiveer';
  }
}
