import Component from '@glimmer/component';

import { service } from '@ember/service';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

function getOverlappingMandate() {
  return trackedFunction(async () => {
    const replacement = this.args.selected;
    if (replacement.id === this.args.mandataris.isBestuurlijkeAliasVan.id) {
      return;
    }
    return await this.mandataris.getOverlappingMandate(
      this.args.mandataris,
      replacement
    );
  });
}

export default class MandatarissenReplacementComponent extends Component {
  @service mandataris;

  @use(getOverlappingMandate) getOverlappingMandate;

  get overlappingMandate() {
    console.log('overlapping', this.getOverlappingMandate?.value);
    return this.getOverlappingMandate?.value;
  }
}
