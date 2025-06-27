import Controller from '@ember/controller';

import { service } from '@ember/service';

export default class ReportController extends Controller {
  @service validatie;

  get allValidationErrors() {
    return this.validatie.resultsOrderedByClassAndInstance;
  }

  get isEmptyResult() {
    return !this.reportIsRunning && this.allValidationErrors.length === 0;
  }

  get reportIsRunning() {
    return this.validatie.isRunning;
  }
}
