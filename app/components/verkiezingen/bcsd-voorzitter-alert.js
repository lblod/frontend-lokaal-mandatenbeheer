import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';

import { task } from 'ember-concurrency';

import { queryRecord } from 'frontend-lmb/utils/query-record';
import {
  MANDAAT_LID_RMW_ID,
  MANDAAT_LID_VAST_BUREAU_ID,
  MANDAAT_SCHEPEN_ID,
  MANDAAT_TOEGEVOEGDE_SCHEPEN_ID,
} from 'frontend-lmb/utils/well-known-ids';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @service store;

  @tracked messages = A();

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
        [MANDAAT_SCHEPEN_ID, MANDAAT_TOEGEVOEGDE_SCHEPEN_ID]
      );
      if (!schepen) {
        if (!this.messages.findBy('id', 1)) {
          this.messages.pushObject({
            id: 1,
            message:
              'Kon geen schepen mandataris vinden voor aangeduide voorzitter.',
          });
        }
      } else {
        const toRemove = this.messages.findBy('id', 1);
        if (toRemove) {
          this.messages.removeObject(toRemove);
        }
      }
    }

    if (hasVoorzitter) {
      const isLidRMWOrVastBureau =
        await this.findMandatarisForOneOfBestuursfunctieCodes(
          hasVoorzitter.persoon,
          [MANDAAT_LID_RMW_ID, MANDAAT_LID_VAST_BUREAU_ID]
        );
      if (!isLidRMWOrVastBureau) {
        if (!this.messages.findBy('id', 2)) {
          this.messages.pushObject({
            id: 2,
            message:
              'De voorzitter van het BCSD moet lid zijn van de RMW of het Vast Bureau.',
          });
        }
      } else {
        const toRemove = this.messages.findBy('id', 2);
        if (toRemove) {
          this.messages.removeObject(toRemove);
        }
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
