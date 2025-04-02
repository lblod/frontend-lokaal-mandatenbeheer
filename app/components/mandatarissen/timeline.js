import Component from '@glimmer/component';
import { service } from '@ember/service';
import moment from 'moment';

export default class MandatarissenTimeline extends Component {
  @service features;
  @service store;

  get isFeatureEnabled() {
    return this.features.isEnabled('timeline');
  }

  get timelineEvents() {
    const sortedMandatarissen = [...this.args.mandatarissen].sort(
      (a, b) => a.start - b.start
    );
    const events = sortedMandatarissen.map((mandataris, index) => {
      return {
        type: index > 0 ? 'Wijziging' : 'Start',
        active: mandataris.isCurrentlyActive,
        date: mandataris.start,
        mandataris,
        previousMandataris: index > 0 ? sortedMandatarissen[index - 1] : null,
        nextMandataris:
          index < sortedMandatarissen.length - 1
            ? sortedMandatarissen[index + 1]
            : null,
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
    if (this.args.history) {
      events.forEach((event) => {
        event.corrections = this.args.history.find(
          (h) => h.mandataris.id === event.mandataris.id
        )?.corrections;
      });
    }
    events[events.length - 1].last = true;
    return events;
  }
}
