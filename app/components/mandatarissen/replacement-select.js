import Component from '@glimmer/component';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenReplacementComponent extends Component {
  @service mandataris;

  @tracked overlappingMandate;

  @keepLatestTask
  async checkMandate() {
    const replacement = this.args.selected;
    this.overlappingMandate = await this.mandataris.getOverlappingMandate(
      this.args.mandataris,
      replacement
    );
  }

  @action
  checkIfMandateAlreadyExists() {
    if (!this.args.selected) {
      return;
    }
    this.checkMandate.perform();
  }
}
