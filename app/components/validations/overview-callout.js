import Component from '@glimmer/component';
import { service } from '@ember/service';
import { use } from 'ember-resources';
import { trackedFunction } from 'reactiveweb/function';

export default class ValidationsOverviewCallout extends Component {
  @service validatie;
  @service features;

  @use(getValidationResults)
  validationResults;

  get validationErrorCount() {
    return (this.validationResults?.value || []).length;
  }

  get hasValidationErrors() {
    return this.validationErrorCount > 0;
  }

  get show() {
    return this.features.isEnabled('shacl-report') && this.hasValidationErrors;
  }
}

function getValidationResults() {
  return trackedFunction(async () => {
    return await this.validatie.latestValidationResults;
  });
}
