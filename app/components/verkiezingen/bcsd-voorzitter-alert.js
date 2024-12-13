import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { task } from 'ember-concurrency';

import { queryRecord } from 'frontend-lmb/utils/query-record';
import {
  BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_BURGEMEESTER_ID,
  MANDAAT_SCHEPEN_CODE_ID,
  MANDAAT_TOEGEVOEGDE_SCHEPEN_CODE_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @service store;

  @tracked errorMessage;

  isVoorzitterAlsoSchepen = task(async () => {
    const bcsdMandatarissen = this.args.mandatarissen;
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
      } else {
        this.errorMessage = null;
      }
    }
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
  async mandatarissenUpdated() {
    if (!this.isVoorzitterAlsoSchepen.isRunning) {
      await this.isVoorzitterAlsoSchepen.perform();
    }
  }
}
