import Controller from '@ember/controller';

import { service } from '@ember/service';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

export default class ReportController extends Controller {
  @service validatie;

  @use(getFlattenedResultsForLatestValidationReport)
  getFlattenedResultsForLatestValidation;

  get allValidationErrors() {
    return this.getFlattenedResultsForLatestValidation?.value || [];
  }

  get isEmptyResult() {
    return !this.reportIsRunning && this.allValidationErrors.length === 0;
  }

  get reportIsRunning() {
    return (
      this.validatie.isRunning ||
      this.getFlattenedResultsForLatestValidation.isLoading
    );
  }
}

function getFlattenedResultsForLatestValidationReport() {
  return trackedFunction(async () => {
    if (!this.validatie.runningStatus) {
      return await this.validatie.getResultsOrderedByClassAndInstance();
    }
  });
}
