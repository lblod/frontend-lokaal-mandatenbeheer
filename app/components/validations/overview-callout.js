import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class ValidationsOverviewCallout extends Component {
  @service validatie;
  @service features;

  get validationResults() {
    return this.validatie.latestValidationResults;
  }

  get validationErrorCount() {
    return this.validatie.activeValidationErrorCount;
  }

  get hasValidationErrors() {
    return this.validationErrorCount > 0;
  }
}
