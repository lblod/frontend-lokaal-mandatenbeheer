import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class ReportRoute extends Route {
  @service store;
  @service router;
  @service features;
  @service session;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.features.isEnabled('shacl-report')) {
      this.router.replaceWith('index');
    }
  }

  async model() {
    const latestReport = (
      await this.store.query('report', {
        sort: '-created',
        page: { size: 1 },
        include: 'validationresults',
      })
    )?.firstObject;

    return {
      report: latestReport,
      resultsByTargetClass: await this.getMappedResults(latestReport),
    };
  }

  async getMappedResults(report) {
    const results = (await report?.validationresults) ?? [];
    const map = new Map();

    for (const result of results) {
      const currentResult = map.get(result.targetClassOfFocusNode) ?? [];
      map.set(result.targetClassOfFocusNode, currentResult.concat(result));
    }
    return map;
  }
}
