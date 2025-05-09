import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MandatarissenReplacementComponent extends Component {
  @tracked overlappingMandate;
  @service mandataris;

  @action
  async selectPerson(person) {
    await this.hasOverlappingMandate(person);
    this.args.onSelect(person, this.overlappingMandate);
  }

  async hasOverlappingMandate(replacement) {
    if (replacement.id === this.args.mandataris.isBestuurlijkeAliasVan.id) {
      return;
    }
    this.overlappingMandate = await this.mandataris.getOverlappingMandate(
      this.args.mandataris,
      replacement
    );
  }
}
