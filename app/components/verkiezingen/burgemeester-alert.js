import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import {
  MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
  MANDAAT_BURGEMEESTER_CODE,
} from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @service store;
  @service bcsd;

  @tracked errorMessage = '';
  @tracked lastRecomputeTime = null;

  constructor() {
    super(...arguments);
    this.bcsd.forceRecomputeBCSD();
  }

  get collegeOrgaanInTijd() {
    return this.args.collegeBestuursorgaanInTijd;
  }

  // Polling because otherwise changes in the installatievergadering data are not picked up
  handleErrorMessage = task({ restartable: true }, async () => {
    if (this.isDestroyed) {
      return;
    }
    if (
      this.lastRecomputeTime &&
      this.lastRecomputeTime === this.bcsd.recomputeBCSDNeededTime
    ) {
      await timeout(5000);
      // nothing for now let's try again later
      this.handleErrorMessage.perform();
      return;
    }

    this.lastRecomputeTime = this.bcsd.recomputeBCSDNeededTime;

    const burgemeesters = await this.getBurgemeesters();
    const aangewezenBurgemeesters = await this.getAangewezenBurgemeesters();
    if (burgemeesters.length > 0) {
      this.errorMessage =
        'Er is een burgemeester aangeduid. Voor de installatievergadering mag er enkel een aangewezen burgemeester aangeduid worden.';
    } else if (aangewezenBurgemeesters.length > 1) {
      this.errorMessage = `Er moet exact één aangewezen burgemeester zijn. Er werden er ${aangewezenBurgemeesters.length} gevonden.`;
    } else {
      this.errorMessage = '';
    }

    await timeout(5000);
    this.handleErrorMessage.perform();
  });

  async getBurgemeesters() {
    return await this.store.query('mandataris', {
      filter: {
        bekleedt: {
          bestuursfunctie: {
            ':uri:': MANDAAT_BURGEMEESTER_CODE,
          },
          'bevat-in': {
            ':uri:': this.collegeOrgaanInTijd.uri,
          },
        },
        ':has:is-bestuurlijke-alias-van': true,
      },
    });
  }

  async getAangewezenBurgemeesters() {
    return await this.store.query('mandataris', {
      filter: {
        bekleedt: {
          bestuursfunctie: {
            ':uri:': MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
          },
          'bevat-in': {
            ':uri:': this.collegeOrgaanInTijd.uri,
          },
        },
        ':has:is-bestuurlijke-alias-van': true,
      },
    });
  }
}
