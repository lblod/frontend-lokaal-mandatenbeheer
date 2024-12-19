import Component from '@glimmer/component';

import { service } from '@ember/service';

export default class SharedModulesComponent extends Component {
  @service currentSession;

  get showLegislatuurModule() {
    return this.currentSession.showLegislatuurModule;
  }
}
