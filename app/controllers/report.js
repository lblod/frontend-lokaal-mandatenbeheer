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
    return !this.reportIsRunning && this.resultsByTargetClass.length === 0;
  }

  get reportIsRunning() {
    return (
      this.validatie.isRunning ||
      this.getResultsByClassForLatestValidationReport.isLoading
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
