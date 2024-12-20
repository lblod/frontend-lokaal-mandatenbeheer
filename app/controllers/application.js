import Controller from '@ember/controller';

import { getOwner } from '@ember/application';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ApplicationController extends Controller {
  @service session;
  @service impersonation;
  @service currentSession;
  @service store;
  @service router;

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

    if (this.isImpersonating) {
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

  get environmentMessage() {
    const productieUrl = 'https://mandatenbeheer.lokaalbestuur.vlaanderen.be/';
    const applicationName = 'Lokaal Mandatenbeheer';

    if (this.environmentName === 'PROD') {
      return `Dit is de <strong>${this.environmentInfo.title}</strong> van het ${applicationName} met fictieve en testgegevens. Deze data is nog niet effectief en zal dus op termijn verwijderd worden als de applicatie live gaat.`;
    }

    return `Dit is de <strong>${this.environmentInfo.title}</strong> van het ${applicationName} met fictieve en testgegevens. De productieomgeving met de echte data vind je op <a href="${productieUrl}" title="${applicationName}" rel="tag">${productieUrl}</a>.`;
  }

  get isLocalhost() {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]'
    ) {
      return true;
    } else {
      return false;
    }
  }

  get environmentName() {
    const thisEnvironmentName = this.isLocalhost
      ? 'LOCAL'
      : getOwner(this).resolveRegistration('config:environment')
          .environmentName;

    return thisEnvironmentName;
  }

  get environmentInfo() {
    let environment = this.environmentName;
    switch (environment) {
      case 'QA':
        return {
          title: 'testomgeving',
          skin: 'warning',
        };
      case 'DEV':
        return {
          title: 'ontwikkelomgeving',
          skin: 'success',
        };
      case 'LOCAL':
        return {
          title: 'lokale omgeving',
          skin: 'success',
        };
      case 'PROD':
        return {
          title: 'Productie omgeving',
          skin: 'error',
        };
      default:
        return {
          title: '',
        };
    }
  }

  get showEnvironment() {
    return (
      this.environmentName !== '' &&
      this.environmentName !== 'PROD' &&
      this.environmentInfo.title !== '' &&
      this.environmentName !== '{{ENVIRONMENT_NAME}}'
    );
  }

  get user() {
    if (!this.isImpersonating) {
      return null;
    }

    return this.currentSession.user;
  }

  get isImpersonating() {
    return this.impersonation.isImpersonating;
  }

  get adminLabel() {
    return this.isImpersonating ? `Admin: ${this.user.fullName}` : 'Admin';
  }
}
