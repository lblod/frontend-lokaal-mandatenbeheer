import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import moment from 'moment';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

export default class MandatarissenTimelineCard extends Component {
  @service router;
  @service validatie;
  @service features;

  @use(getValidationError)
  hasValidationError;

  get editor() {
    return this.args.event.corrections?.[0]?.creator;
  }

  get editedAt() {
    return this.args.event.corrections?.[0]?.issued;
  }

  get hasOverlapWithNext() {
    if (!this.args.event.nextMandataris) {
      return false;
    }
    return moment(this.args.event.mandataris.einde || '3000-01-02').isAfter(
      moment(this.args.event.nextMandataris.start || '3000-01-01'),
      'day'
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

function getValidationError() {
  return trackedFunction(async () => {
    if (!this.features.isEnabled('shacl-report')) {
      return false;
    }
    if (this.args.event.mandataris) {
      const issues = await this.validatie.getIssuesForId(
        this.args.event.mandataris.id
      );
      return issues.length > 0;
    }
  });
}
