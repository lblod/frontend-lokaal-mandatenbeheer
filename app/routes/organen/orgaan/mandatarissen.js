import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class OrganenMandatarissenRoute extends Route {
  @service currentSession;
  @service store;
  @service installatievergadering;
  @service semanticFormRepository;

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

    const bestuurseenheid = this.currentSession.group;

    let mandatarissen;
    if (currentBestuursorgaan) {
      const options = this.getOptions(params, currentBestuursorgaan);

      mandatarissen = await this.store.query('mandataris', options);
    }
    const folded = await foldMandatarisses(params, mandatarissen);
    const mandatarisNewForm =
      await this.semanticFormRepository.getFormDefinition(
        MANDATARIS_NEW_FORM_ID
      );

    const legislatuurInBehandeling =
      await this.installatievergadering.activeOrNoLegislature(
        parentModel.selectedBestuursperiode
      );
    const isDistrict = this.currentSession.isDistrict;

    return {
      bestuurseenheid,
      mandatarissen: this.getFilteredMandatarissen(folded, params),
      bestuursorgaan: parentModel.bestuursorgaan,
      bestuursorgaanInTijdId: await this.getBestuursorgaanInTijdId(
        parentModel.selectedBestuursperiode,
        parentModel.bestuursorgaan
      ),
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarisNewForm: mandatarisNewForm,
      currentBestuursorgaan: currentBestuursorgaan,
      legislatuurInBehandeling: isDistrict ? false : legislatuurInBehandeling,
    };
  }

  async setupController(controller, model) {
    super.setupController(controller, model);

    await controller.isSelectedPeriodCurrent();
  }

  async getBestuursorgaanInTijdId(selectedBestuursperiode, bestuursorgaan) {
    const bestuursorganenInTijdFromPeriod =
      (await selectedBestuursperiode.heeftBestuursorganenInTijd) ?? [];
    const bestuursorganenInTijd =
      (await bestuursorgaan?.heeftTijdsspecialisaties) ?? [];
    const fromPeriodIds = bestuursorganenInTijdFromPeriod.map((boi) => boi.id);
    const boiIds = bestuursorganenInTijd.map((boi) => boi.id);
    const boiInPeriod = boiIds.filter((id) => fromPeriodIds.includes(id));

    if (boiInPeriod.length >= 1) {
      return boiInPeriod.at(0);
    }
    return null;
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
      filteredMandatarissen = mandatarissen.filter(
        (mandataris) => mandataris.mandataris.isActive
      );
    }
    return filteredMandatarissen;
  }
}
