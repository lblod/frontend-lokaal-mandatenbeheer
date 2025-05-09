import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedMainMenuComponent extends Component {
  @service currentSession;
  @service validatie;

  get validationText() {
    return this.validatie.latestValidationResults.length > 0
      ? `${this.validatie.latestValidationResults.length} validatiefouten`
      : 'Geen validatiefouten';
  }

  get validationIcon() {
    return this.validatie.latestValidationResults.length > 0
      ? 'alert-triangle'
      : 'circle-check';
  }
}
