import Controller from '@ember/controller';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ReportController extends Controller {
  @service validatie;

  queryParams = ['showSilencedResults'];

  @tracked showSilencedResults = false;

  get allValidationErrors() {
    return this.validatie.resultsOrderedByClassAndInstance.filter((result) => {
      return this.showSilencedResults || !result.instance.result.silencer;
    });
  }

  get validationResults() {
    return this.validatie.latestValidationResults;
  }

  get validationErrorCount() {
    return this.validatie.activeValidationErrorCount;
  }

  get hasValidationErrors() {
    return this.validationErrorCount > 0;
  }

  get isEmptyResult() {
    return !this.reportIsRunning && this.allValidationErrors.length === 0;
  }

  get countSilencedResults() {
    return this.validatie.resultsOrderedByClassAndInstance.filter((result) => {
      return result.instance.result.silencer;
    }).length;
  }

  get reportIsRunning() {
    return this.validatie.isRunning;
  }

  @action
  toggleShowSilencedResults() {
    this.showSilencedResults = !this.showSilencedResults;
  }
}
