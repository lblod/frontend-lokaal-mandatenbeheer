import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ApplicationController extends Controller {
  @service session;
  @service impersonation;
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
      const unreadGroupNotifications = await this.store.query(
        'system-notification',
        {
          'filter[:has-no:read-at]': true,
          'filter[:has-no:archived-at]': true,
          'filter[:has-no:gebruiker]': true,
        }
      );

      this.notificationCount =
        unreadNotifications.meta.count + unreadGroupNotifications.meta.count;
    } else {
      await timeout(10);
      this.setNotificationCount.perform();
    }
  });

  get userInfo() {
    let user;
    let group;
    let classification;

    if (this.impersonation.isImpersonating) {
      user = this.impersonation.originalAccount.gebruiker;
      group = this.impersonation.originalGroup;
      classification = group.belongsTo('classificatie').value();
    } else {
      user = this.currentSession.user;
      group = this.currentSession.group;
      classification = this.currentSession.groupClassification;
    }

    if (!user) {
      return '';
    }

    let userInfo = user.fullName;
    let groupInfo = '';

    if (classification?.label) {
      groupInfo += classification.label;
    }

    if (group?.naam) {
      groupInfo += ` ${group.naam}`;
    }

    groupInfo.trim();

    if (groupInfo.length) {
      userInfo += ` - ${groupInfo}`;
    }

    return userInfo;
  }
}
