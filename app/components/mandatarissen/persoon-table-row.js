import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

import { restartableTask } from 'ember-concurrency';

export default class MandatarissenPersoonTableRowComponent extends Component {
  @tracked isSubRowOpen;

  getSubRowData = restartableTask(async () => {
    this.isSubRowOpen = !this.isSubRowOpen;
  });

  get persoonDetailRoute() {
    return 'mandatarissen.persoon.mandaten';
  }

  get iconSubRowOpen() {
    return this.isSubRowOpen ? 'nav-down' : 'nav-up';
  }
}
