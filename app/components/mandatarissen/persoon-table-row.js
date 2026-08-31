import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MandatarissenPersoonTableRowComponent extends Component {
  @tracked isSubRowOpen;

  @action
  openCloseSubRows() {
    this.isSubRowOpen = !this.isSubRowOpen;
  }

  get firstRow() {
    return this.args.mandatarissen.find((value) => value.isSubRow === false);
  }

  get subRows() {
    return this.args.mandatarissen.map((value) => value.rowData);
  }

  get mandatarissen() {
    return this.args.mandatarissen.map((value) => value.mandataris);
  }

  get hasOnlyOneMandaat() {
    const mandaatSet = new Set();
    this.mandatarissen.forEach((m) => {
      mandaatSet.add(m.bekleedt.id);
    });
    return mandaatSet.size === 1;
  }

  get showCombinedInfo() {
    return this.mandatarissen.length > 1 && !!this.isSubRowOpen === false;
  }

  get persoonDetailRoute() {
    return 'mandatarissen.persoon.mandaten';
  }

  get iconSubRowOpen() {
    return this.isSubRowOpen ? 'nav-up' : 'nav-down';
  }

  get subRowButtonClass() {
    return this.hasOnlyOneMandaat ? 'hidden-element' : '';
  }
}
