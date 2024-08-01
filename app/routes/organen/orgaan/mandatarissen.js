import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';
import moment from 'moment';

export default class OrganenMandatarissenRoute extends Route {
  @service store;
  @service installatievergadering;

  queryParams = {
    activeOnly: { refreshModel: true },
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const currentBestuursorgaan = await parentModel.currentBestuursorgaan;

    let mandatarissen;
    if (currentBestuursorgaan) {
      const options = this.getOptions(params, currentBestuursorgaan);

      mandatarissen = await this.store.query('mandataris', options);
    }
    const folded = await foldMandatarisses(params, mandatarissen);
    const mandatarisNewForm = await getFormFrom(
      this.store,
      MANDATARIS_NEW_FORM_ID
    );

    const legislatuurInBehandeling =
      await this.installatievergadering.activeOrNoLegislature(
        parentModel.selectedBestuursperiode
      );

    return {
      mandatarissen: this.getFilteredMandatarissen(folded, params),
      bestuursorgaan: parentModel.bestuursorgaan,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarisNewForm: mandatarisNewForm,
      currentBestuursorgaan: currentBestuursorgaan,
      legislatuurInBehandeling,
    };
  }

  getOptions(params, bestuursOrgaan) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        bekleedt: {
          'bevat-in': {
            id: bestuursOrgaan.id,
          },
        },
        ':has:is-bestuurlijke-alias-van': true,
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

  getFilteredMandatarissen(mandatarissen, params) {
    let filteredMandatarissen = mandatarissen;
    if (params.activeOnly) {
      filteredMandatarissen = mandatarissen.filter((mandataris) =>
        moment().isBetween(mandataris.foldedStart, mandataris.foldedEnd)
      );
    }
    return filteredMandatarissen;
  }
}
