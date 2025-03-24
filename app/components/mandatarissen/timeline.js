import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class MandatarissenTimeline extends Component {
  @service features;
  @service router;

  get isFeatureEnabled() {
    return this.features.isEnabled('shacl-report');
  }

  get timelineEvents() {
    const mandatarissen = this.args.mandatarissen;
    const sortedMandatarissen = mandatarissen.sortBy('start');
    return sortedMandatarissen.map((mandataris, index) => {
      return {
        type: index > 0 ? 'Wijziging' : 'Aanmaak',
        active: mandataris.isActive,
        date: mandataris.start,
        mandataris,
        last: index === mandatarissen.length - 1,
        selected: mandataris.id === this.args.mandataris.id,
      };
    });
  }

  @action
  selectEvent(event) {
    this.router.transitionTo(
      'mandatarissen.persoon.mandataris',
      event.mandataris.id
    );
  }
}
