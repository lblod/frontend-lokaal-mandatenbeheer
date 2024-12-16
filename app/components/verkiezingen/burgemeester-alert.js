import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import { consume } from 'ember-provide-consume-context';

import {
  MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
  MANDAAT_BURGEMEESTER_CODE,
} from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @consume('alert-group') alerts;
  @service store;
  @service installatievergadering;

  @tracked errorMessageId = 'cb8e18dd-647a-452b-a2a3-67bb644cfc4e';
  @tracked errorMessage;
  @tracked lastRecomputeTime = null;

  get collegeOrgaanInTijd() {
    return this.args.collegeBestuursorgaanInTijd;
  }

  handleErrorMessage = task({ restartable: true }, async () => {
    const burgemeesters = await this.getBurgemeesters();
    const aangewezenBurgemeesters = await this.getAangewezenBurgemeesters();
    if (burgemeesters.length > 0) {
      this.errorMessage =
        'Er is een burgemeester aangeduid. Voor de installatievergadering mag er enkel een aangewezen burgemeester aangeduid worden.';
    } else if (aangewezenBurgemeesters.length > 1) {
      this.errorMessage = `Er moet exact één aangewezen burgemeester zijn. Er werden er ${aangewezenBurgemeesters.length} gevonden.`;
    } else {
      this.errorMessage = null;
    }
    this.onUpdate();
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

  @action
  onUpdate() {
    const exists = this.alerts.findBy('id', this.errorMessageId);
    if (exists) {
      this.alerts.removeObject(exists);
    }

    if (!this.errorMessage) {
      return;
    }

    this.alerts.pushObject({
      id: this.errorMessageId,
      message: this.errorMessage,
    });
  }
}
