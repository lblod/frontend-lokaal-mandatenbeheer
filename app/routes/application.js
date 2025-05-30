import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { warn } from '@ember/debug';

import ENV from 'frontend-lmb/config/environment';
import 'moment';
import 'moment-timezone';
import { registerCustomFormFields } from 'frontend-lmb/utils/register-form-fields';
import { registerCustomValidations } from 'frontend-lmb/utils/form-validations/register';

export default class ApplicationRoute extends Route {
  @service currentSession;
  @service moment;
  @service session;
  @service plausible;
  @service router;
  @service decretaleOrganen;
  @service mandatarisStatus;
  @service formReplacements;
  @service validatie;
  async beforeModel() {
    await this.session.setup();
    await this._loadCurrentSession();
    await this.formReplacements.setup();
    await Promise.all([
      this.decretaleOrganen.setup(),
      this.mandatarisStatus.loadStatusOptions(),
      this.validatie.setup(),
    ]);

    const moment = this.moment;
    moment.setLocale('nl-be');
    moment.setTimeZone('Europe/Brussels');
    moment.set('defaultFormat', 'DD MMM YYYY, HH:mm');

    this.startAnalytics();
    registerCustomFormFields();
    registerCustomValidations();
  }

  startAnalytics() {
    let { domain, apiHost } = ENV.plausible;

    if (
      domain !== '{{ANALYTICS_APP_DOMAIN}}' &&
      apiHost !== '{{ANALYTICS_API_HOST}}'
    ) {
      this.plausible.enable({
        domain,
        apiHost,
      });
    }
  }

  async _loadCurrentSession() {
    try {
      await this.currentSession.load();
    } catch (error) {
      warn(error, { id: 'current-session-load-failure' });
      this.router.transitionTo('auth.logout');
    }
  }
}
