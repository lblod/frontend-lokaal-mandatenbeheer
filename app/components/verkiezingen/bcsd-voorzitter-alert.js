import Component from '@glimmer/component';

import { service } from '@ember/service';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

import { queryRecord } from 'frontend-lmb/utils/query-record';
import {
  BESTUURSFUNCTIE_AANGEWEZEN_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_BURGEMEESTER_ID,
  MANDAAT_SCHEPEN_CODE_ID,
  MANDAAT_TOEGEVOEGDE_SCHEPEN_CODE_ID,
} from 'frontend-lmb/utils/well-known-ids';

function getErrorMessage() {
  return trackedFunction(async () => {
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
        return 'Kon geen burgemeester of schepen mandataris vinden voor aangeduide voorzitter.';
      }
    }

    return null;
  });
}

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @service store;
  @use(getErrorMessage) getErrorMessage;

  get errorMessage() {
    return this.getErrorMessage?.value;
  }

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
}
