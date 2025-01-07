import Component from '@glimmer/component';

import { action } from '@ember/object';

export default class MandatarissenPersoonTableComponent extends Component {
  @action
  mandatarissenFor(persoon) {
    return (
      this.args.personenWithMandatarissen.find(
        (value) => value.persoon.id === persoon.id
      )?.mandatarissen ?? []
    );
  }
}
