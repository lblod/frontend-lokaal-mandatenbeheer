import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import moment from 'moment';

export default class MandatarissenTimeline extends Component {
  @service features;
  @service router;

  get isFeatureEnabled() {
    return this.features.isEnabled('shacl-report');
  }

  get timelineEvents() {
    const mandatarissen = this.args.mandatarissen;
    const sortedMandatarissen = mandatarissen.sortBy('start');
    const events = sortedMandatarissen.map((mandataris, index) => {
      return {
        type: index > 0 ? 'Wijziging' : 'Aanmaak',
        active: mandataris.isCurrentlyActive,
        date: mandataris.start,
        mandataris,
        selected: mandataris.id === this.args.mandataris.id,
      };
    });
    const lastMandataris = sortedMandatarissen[sortedMandatarissen.length - 1];
    if (lastMandataris.einde) {
      events.push({
        type: 'Einde',
        active: moment().isAfter(lastMandataris.einde),
        date: lastMandataris.einde,
        mandataris: lastMandataris,
        selected: false,
      });
    }
    events[events.length - 1].last = true;
    return events;
  }

  @action
  selectEvent(event) {
    this.router.transitionTo(
      'mandatarissen.persoon.mandataris',
      event.mandataris.id
    );
  }
}
