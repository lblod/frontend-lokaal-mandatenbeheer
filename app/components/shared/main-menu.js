import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedMainMenuComponent extends Component {
  @service currentSession;
  @service validatie;

  get validationCount() {
    return this.validatie.latestValidationResults?.length || 0;
  }

  get validationIcon() {
    return this.validatie.latestValidationResults?.length > 0
      ? 'alert-triangle'
      : 'circle-check';
  }
}
