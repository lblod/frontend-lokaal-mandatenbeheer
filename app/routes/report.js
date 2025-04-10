import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class ReportRoute extends Route {
  @service store;
  @service router;
  @service features;
  @service session;
  @service validatie;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.features.isEnabled('shacl-report')) {
      this.router.replaceWith('index');
    }
  }

  async model() {
    const latestReport = this.validatie.latestValidationReport;
    this.validatie.polling.perform();
    await this.validatie.setLastRunningStatus();
    return {
      report: latestReport,
      resultsByTargetClass:
        await this.validatie.getResultsByClass(latestReport),
    };
  }
}
