import Route from '@ember/routing/route';
import RSVP from 'rsvp';

import { service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import {
  BCSD_BESTUURSORGAAN_URI,
  BURGEMEESTER_BESTUURSORGAAN_URI,
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
  RMW_BESTUURSORGAAN_URI,
  VB_BESTUURSORGAAN_URI,
} from 'frontend-lmb/utils/well-known-uris';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;
  @service bestuursperioden;
  @service bestuursorganen;

  queryParams = {
    filter: { refreshModel: true },
    sort: { refreshModel: true },
    bestuursperiode: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('verkiezingen');
    const bestuurseenheid = parentModel.bestuurseenheid;

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
      'filter[installatievergaderingen][bestuurseenheid][:id:]':
        bestuurseenheid.id,
    });
    if (bestuursPeriods.length == 0) {
      return RSVP.hash({
        bestuurseenheid,
        isRelevant: false,
      });
    }
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      params.bestuursperiode
    );

    const ivStatuses = await this.store.findAll(
      'installatievergadering-status'
    );

    const installatievergadering = (
      await this.store.query('installatievergadering', {
        'filter[bestuurseenheid][id]': bestuurseenheid.id,
        'filter[bestuursperiode][:id:]': selectedPeriod.id,
        include: ['status'].join(','),
      })
    )[0];

    const bestuursorganenInTijd =
      await this.getBestuursorganenInTijd(selectedPeriod);

    // TODO For now this is the gemeenteraad, should be split up in the different bestuursorganen we need.
    const bestuursorgaanInTijd = (
      await this.store.query('bestuursorgaan', {
        'filter[is-tijdsspecialisatie-van][classificatie][:uri:]':
          'http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/5ab0e9b8a3b2ca7c5e000005',
        'filter[heeft-bestuursperiode][:id:]': selectedPeriod.id,
      })
    )[0];

    let mandatarissen, kandidatenlijsten;
    if (bestuursorgaanInTijd) {
      mandatarissen = await this.getMandatarissen(params, bestuursorgaanInTijd);
      kandidatenlijsten = await this.getKandidatenLijsten(selectedPeriod);
    }

    const mandatarisNewForm = getFormFrom(this.store, MANDATARIS_NEW_FORM_ID);

    return RSVP.hash({
      ivStatuses,
      installatievergadering,
      bestuurseenheid,
      bestuursorgaanInTijd,
      mandatarisNewForm,
      mandatarissen,
      kandidatenlijsten,
      bestuursPeriods,
      selectedPeriod,
      isRelevant: parentModel.isRelevant,
    });
  }

  async getBestuursorganenInTijd(selectedPeriod) {
    const allBestuursOrganenInTijd = (
      await this.bestuursorganen.getAllRelevantPoliticalBestuursorganenInTijd(
        selectedPeriod
      )
    ).slice();

    const bestuursorgaanOrder = [
      GEMEENTERAAD_BESTUURSORGAAN_URI,
      RMW_BESTUURSORGAAN_URI,
      BURGEMEESTER_BESTUURSORGAAN_URI,
      CBS_BESTUURSORGAAN_URI,
      VB_BESTUURSORGAAN_URI,
      BCSD_BESTUURSORGAAN_URI,
    ];

    const bestuursorgaanUris = await Promise.all(
      allBestuursOrganenInTijd.map(async (orgaan) => {
        return (await (await orgaan.isTijdsspecialisatieVan).classificatie).uri;
      })
    );

    let sortedBestuursorganenInTijd = new Array(
      allBestuursOrganenInTijd.length
    );
    await bestuursorgaanUris.forEach(function (uri, i) {
      const index = bestuursorgaanOrder.indexOf(uri);
      sortedBestuursorganenInTijd[index] = allBestuursOrganenInTijd[i];
    });
    return sortedBestuursorganenInTijd;
  }

  async getMandatarissen(params, bestuursOrgaan) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: 0,
        size: 9999,
      },
      filter: {
        bekleedt: {
          'bevat-in': {
            id: bestuursOrgaan.id,
          },
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
        'beleidsdomein',
      ].join(','),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return this.store.query('mandataris', queryParams);
  }

  async getKandidatenLijsten(bestuursperiode) {
    const queryParams = {
      'filter[verkiezing][bestuursorgaan-in-tijd][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      include: 'resulterende-fracties',
    };

    return await this.store.query('kandidatenlijst', queryParams);
  }
}
