import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class SystemNotificationsRoute extends Route {
  @service currentSession;
  @service store;

  async model() {
    const notifications = await this.store.query('system-notification', {
      'filter[gebruiker][:id:]': this.currentSession.user.id,
    });

    return {
      notifications: notifications ?? [],
    };
  }
}
