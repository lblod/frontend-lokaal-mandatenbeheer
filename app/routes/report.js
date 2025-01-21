import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class ReportRoute extends Route {
  @service store;

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
      validationresults: (await latestReport?.validationresults) ?? [],
    };
  }
}
