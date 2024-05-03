import Route from '@ember/routing/route';
import RSVP from 'rsvp';

import { service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;
  @service currentSession;

  queryParams = {
    filter: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const bestuurseenheid = this.currentSession.group;
    const parentModel = this.modelFor('verkiezingen.verkiezingsuitslag');
    const bestuursorgaanInTijd =
      await parentModel.installatievergadering.bestuursorgaanInTijd;

    let mandatarissen;
    if (bestuursorgaanInTijd) {
      mandatarissen = await this.getMandatarissen(params, bestuursorgaanInTijd);
    }

    let kandidatenlijsten = await this.getKandidatenLijsten(bestuursorgaan);

    const bestuursorgaan = bestuursorgaanInTijd.isTijdsspecialisatieVan;
    const mandatarisNewForm = getFormFrom(this.store, MANDATARIS_NEW_FORM_ID);

    return RSVP.hash({
      ...parentModel,
      bestuurseenheid,
      bestuursorgaanInTijd,
      bestuursorgaan,
      mandatarisNewForm,
      mandatarissen,
      kandidatenlijsten,
    });
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
      ].join(','),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return this.store.query('mandataris', queryParams);
  }

  async getKandidatenLijsten(bestuursOrgaan) {
    const queryParams = {
      'filter[verkiezing][bestuursorgaan-in-tijd][id]': bestuursOrgaan.id,
      include: 'resulterende-fracties',
    };

    return await this.store.query('kandidatenlijst', queryParams);
  }
}
