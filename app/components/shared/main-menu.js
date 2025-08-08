import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedMainMenuComponent extends Component {
  @service currentSession;
  @service validatie;

  get validationCount() {
    return this.validatie.activeValidationErrorCount;
  }

  get validationIcon() {
    return this.validationCount > 0 ? 'alert-triangle' : 'circle-check';
  }
}
