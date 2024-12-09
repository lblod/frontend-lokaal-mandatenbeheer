import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { restartableTask } from 'ember-concurrency';

import { queryRecord } from 'frontend-lmb/utils/query-record';
import {
  MANDAAT_SCHEPEN_ID,
  MANDAAT_TOEGEVOEGDE_SCHEPEN_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class VerkiezingenBcsdVoorzitterNotSchepenAlertComponent extends Component {
  @service store;

  @tracked warningMessage;

  isVoorzitterAlsoSchepen = restartableTask(async () => {
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
      const schepen = await queryRecord(this.store, 'mandataris', {
        'filter[bekleedt][bevat-in][heeft-bestuursperiode][:uri:]':
          this.args.bestuursperiode.uri,
        'filter[is-bestuurlijke-alias-van][:uri:]': hasVoorzitter.persoon.uri,
        'filter[bekleedt][bestuursfunctie][:id:]': [
          MANDAAT_SCHEPEN_ID,
          MANDAAT_TOEGEVOEGDE_SCHEPEN_ID,
        ].join(','),
      });
      if (!schepen) {
        this.warningMessage =
          'Kon geen schepen mandataris vinden voor aangeduide voorzitter.';
      } else {
        this.warningMessage = null;
      }
    }
  });

  @action
  async mandatarissenUpdated() {
    await this.isVoorzitterAlsoSchepen.perform();
  }
}
