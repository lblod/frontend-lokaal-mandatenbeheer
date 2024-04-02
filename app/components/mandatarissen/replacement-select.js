import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenReplacementComponent extends Component {
  @service mandataris;

  @tracked overlappingMandate;

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
    this.checkMandate.perform();
  }
}
