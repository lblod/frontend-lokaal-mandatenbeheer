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

  get isEmptyResult() {
    return (
      !this.validatie.runningStatus && this.resultsByTargetClass.length === 0
    );
  }
}

function getResultsByClassForLatestValidationReport() {
  return trackedFunction(async () => {
    if (!this.validatie.runningStatus) {
      return await this.validatie.getResultsByClass();
    }
  });
}
