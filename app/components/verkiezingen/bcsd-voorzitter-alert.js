import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { restartableTask } from 'ember-concurrency';
import { consume } from 'ember-provide-consume-context';

import { queryRecord } from 'frontend-lmb/utils/query-record';
import {
  BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_BURGEMEESTER_ID,
  MANDAAT_SCHEPEN_CODE_ID,
  MANDAAT_TOEGEVOEGDE_SCHEPEN_CODE_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @consume('alert-group') alerts;
  @service store;
  @service installatievergadering;

  @tracked errorMessageId = 'fd8e8697-ce9b-492e-adf1-6d8fe823d434';
  @tracked errorMessage;

  isVoorzitterAlsoSchepen = restartableTask(async () => {
    const bcsdMandatarissen = this.args.mandatarissen;

    if (bcsdMandatarissen.length === 0) {
      this.errorMessage = null;
    }

    const mapping = await Promise.all(
      bcsdMandatarissen.map(async (mandataris) => {
        return {
          mandataris,
          persoon: await mandataris.isBestuurlijkeAliasVan,
          isVoorzitter: await (await mandataris.bekleedt).isVoorzitter,
        };
      })
    );
    const hasVoorzitter = mapping.find(
      (mapping) => mapping.persoon && mapping.isVoorzitter
    );
    this.errorMessage = null;
    if (hasVoorzitter) {
      const schepen = await this.findMandatarisForOneOfBestuursfunctieCodes(
        hasVoorzitter.persoon,
        [
          MANDAAT_SCHEPEN_CODE_ID,
          MANDAAT_TOEGEVOEGDE_SCHEPEN_CODE_ID,
          BESTUURSFUNCTIE_BURGEMEESTER_ID,
          BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
        ]
      );
      if (!schepen) {
        this.errorMessage =
          'Kon geen burgemeester of schepen mandataris vinden voor aangeduide voorzitter.';
      }
    }
    this.onUpdate();
  });

  async findMandatarisForOneOfBestuursfunctieCodes(
    voorzitter,
    bestuursfunctieCodes
  ) {
    return await queryRecord(this.store, 'mandataris', {
      'filter[bekleedt][bevat-in][heeft-bestuursperiode][:uri:]':
        this.args.bestuursperiode.uri,
      'filter[is-bestuurlijke-alias-van][:uri:]': voorzitter.uri,
      'filter[bekleedt][bestuursfunctie][:id:]': bestuursfunctieCodes.join(','),
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
