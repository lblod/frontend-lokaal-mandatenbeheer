import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MandatarissenTimelineCard extends Component {
  @service
  router;

  get editor() {
    return this.args.event.corrections?.[0]?.creator;
  }

  get editedAt() {
    return this.args.event.corrections?.[0]?.issued;
  }

  @action
  selectEvent(event) {
    this.router.transitionTo(
      'mandatarissen.persoon.mandataris',
      event.mandataris.id
    );
  }
}
