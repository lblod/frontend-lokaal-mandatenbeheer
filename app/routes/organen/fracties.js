import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { action } from '@ember/object';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { FRACTIE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import {
  FRACTIETYPE_SAMENWERKINGSVERBAND,
  INSTALLATIEVERGADERING_BEHANDELD_STATUS,
} from 'frontend-lmb/utils/well-known-uris';
import RSVP from 'rsvp';

export default class FractiesRoute extends Route {
  @service store;
  @service fractieApi;
  @service bestuursperioden;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    bestuursperiode: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
      'filter[:has:heeft-bestuursorganen-in-tijd]': true,
      include: 'installatievergaderingen,installatievergaderingen.status',
    });

    const filteredBestuursPeriods = (
      await Promise.all(
        bestuursPeriods.map(async (period) => {
          const ivs = await period.installatievergaderingen;
          if (
            ivs.length === 0 ||
            ivs[0].get('status').get('uri') ===
              INSTALLATIEVERGADERING_BEHANDELD_STATUS
          ) {
            return period;
          }
          return null;
        })
      )
    ).filter(Boolean);

    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      filteredBestuursPeriods,
      params.bestuursperiode
    );

    const bestuursorganenIds = await Promise.all(
      parentModel.bestuursorganen.map(async (o) => {
        return (await o).get('id');
      })
    );

    const tijdsspecialisaties = await this.store.query('bestuursorgaan', {
      'filter[is-tijdsspecialisatie-van][:id:]': bestuursorganenIds.join(','),
      'filter[heeft-bestuursperiode][:id:]': selectedPeriod.id,
    });

    const fracties = await this.fractieApi.forBestuursperiode(
      selectedPeriod.id
    );

    const form = await getFormFrom(this.store, FRACTIE_FORM_ID);
    const defaultFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);

    return RSVP.hash({
      form,
      defaultFractieType,
      fracties,
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursPeriods: filteredBestuursPeriods,
      selectedPeriod,
      tijdsspecialisaties,
    });
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
