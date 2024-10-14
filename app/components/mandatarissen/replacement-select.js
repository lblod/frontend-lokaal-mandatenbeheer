import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

export default class MandatarissenReplacementComponent extends Component {
  @service mandataris;

  @tracked overlappingMandate;
  @tracked sameMandate;

  checkMandate = task({ keepLatest: true }, async () => {
    const replacement = this.args.selected;
    this.overlappingMandate = await this.mandataris.getOverlappingMandate(
      this.args.mandataris,
      replacement
    );
  });

  @action
  checkIfMandateAlreadyExists() {
    if (!this.args.selected) {
      return;
    }
    this.checkSameMandate();
    if (this.sameMandate) {
      return;
    }
    this.checkMandate.perform();
  }

  checkSameMandate() {
    this.sameMandate =
      this.args.selected.id === this.args.mandataris.isBestuurlijkeAliasVan.id;
  }
}
