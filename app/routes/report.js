import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class ReportRoute extends Route {
  @service store;

  async model() {
    const reports = await this.store.findAll('report');
    return { reports };
  }
}
