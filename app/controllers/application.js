import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ApplicationController extends Controller {
  @service session;
  @service currentSession;
  @service router;
  @service store;

  @tracked notificationCount;

  appTitle = 'Lokaal mandatenbeheer';

  get isIndex() {
    return this.router.currentRouteName === 'index';
  }

  setNotificationCount = restartableTask(async () => {
    this.notificationCount = 0;
    if (this.currentSession.user) {
      const unreadNotifications = await this.store.query(
        'system-notification',
        {
          'filter[:has-no:read-at]': true,
          'filter[:has-no:archived-at]': true,
          'filter[gebruiker][:id:]': this.currentSession.user.id,
        }
      );
      this.notificationCount = unreadNotifications.length;
    } else {
      await timeout(10);
      this.setNotificationCount.perform();
    }
  });
}
