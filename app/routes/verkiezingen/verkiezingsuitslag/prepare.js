import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('verkiezingen.verkiezingsuitslag');
    const bestuursorgaanInTijd =
      await parentModel.installatievergadering.bestuursorgaanInTijd;

    let mandatarissen;
    if (bestuursorgaanInTijd) {
      mandatarissen = await this.store.query(
        'mandataris',
        this.getOptions(params, bestuursorgaanInTijd)
      );
    }

    const bestuursorgaan = bestuursorgaanInTijd.isTijdsspecialisatieVan;
    const mandatarisNewForm = getFormFrom(this.store, MANDATARIS_NEW_FORM_ID);

    return RSVP.hash({
      ...parentModel,
      bestuursorgaanInTijd,
      bestuursorgaan,
      mandatarisNewForm,
      mandatarissen,
    });
  }

  getOptions(params, bestuursOrgaan) {
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

    return queryParams;
  }
}
