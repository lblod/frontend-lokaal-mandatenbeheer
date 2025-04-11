import Controller from '@ember/controller';

import { service } from '@ember/service';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

export default class ReportController extends Controller {
  @service validatie;

  @use(getResultsByClassForLatestValidationReport)
  getResultsByClassForLatestValidationReport;

  get resultsByTargetClass() {
    return this.getResultsByClassForLatestValidationReport?.value || [];
  }
}

function getResultsByClassForLatestValidationReport() {
  return trackedFunction(async () => {
    if (!this.validatie.polling.isRunning) {
      return await this.validatie.getResultsByClass();
    }
  });
}
