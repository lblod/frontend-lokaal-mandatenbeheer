import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class OrganenMandatarissenRoute extends Route {
  @service currentSession;
  @service store;
  @service installatievergadering;
  @service semanticFormRepository;
  @service('mandatarissen') mandatarissenService;

  queryParams = {
    activeOnly: { refreshModel: true },
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const bestuursorgaanInTijd = await parentModel.currentBestuursorgaan;

    const bestuurseenheid = this.currentSession.group;

    let mandatarissen;
    if (bestuursorgaanInTijd) {
      mandatarissen = await this.mandatarissenService.getMandatarissen(
        params,
        bestuursorgaanInTijd
      );
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
      bestuursorgaanInTijd,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarisNewForm: mandatarisNewForm,
      legislatuurInBehandeling: isDistrict ? false : legislatuurInBehandeling,
    };
  }

  getFilteredMandatarissen(mandatarissen, params) {
    let filteredMandatarissen = mandatarissen;
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('organen.orgaan.mandatarissen');
    if (params.activeOnly && controller.selectedPeriodIsCurrent) {
      filteredMandatarissen = mandatarissen.filter(
        (mandataris) => mandataris.mandataris.isActive
      );
    }
    return filteredMandatarissen;
  }
}
