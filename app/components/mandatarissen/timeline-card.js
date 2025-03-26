import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import moment from 'moment';

export default class MandatarissenTimelineCard extends Component {
  @service
  router;

  get editor() {
    return this.args.event.corrections?.[0]?.creator;
  }

  get editedAt() {
    return this.args.event.corrections?.[0]?.issued;
  }

  get hasOverlapWithNext() {
    return moment(this.args.event.mandataris.einde || '3000-01-02').isAfter(
      moment(this.args.event.nextMandataris?.start || '3000-01-01')
    );
  }

  get beeindigdText() {
    const inTheFuture = moment(
      this.args.event.mandataris.einde || '3000-01-01'
    ).isAfter(moment());
    if (inTheFuture) {
      return 'Dit mandaat wordt beëindigd';
    } else {
      return 'Dit mandaat is beëindigd';
    }
  }

  @action
  selectEvent(event) {
    this.router.transitionTo(
      'mandatarissen.persoon.mandataris',
      event.mandataris.id
    );
  }
}
