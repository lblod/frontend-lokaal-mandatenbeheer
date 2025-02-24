import Route from '@ember/routing/route';

import { service } from '@ember/service';

import {
  MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE,
  MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE,
} from 'frontend-lmb/utils/well-known-uris';

export default class BulkBekrachtigingRoute extends Route {
  @service store;
  @service installatievergadering;
  @service('mandatarissen') mandatarissenService;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const currentBestuursorgaan = await parentModel.currentBestuursorgaan;
    const effectiefIsLastStatus =
      !!(await parentModel.bestuursorgaan.isVastBureau) ||
      (await parentModel.bestuursorgaan.isRMW);

    let mandatarissen;
    let mandatarissenMap;
    if (currentBestuursorgaan) {
      mandatarissen = await this.mandatarissenService.getMandatarissen(
        params,
        currentBestuursorgaan
      );
      mandatarissenMap = await Promise.all(
        mandatarissen.map(async (mandataris) => {
          const uri = (await mandataris.publicationStatus).uri;
          let canShowCheckbox = true;
          if (
            effectiefIsLastStatus &&
            uri === MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE
          ) {
            canShowCheckbox = false;
          } else if (uri === MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE) {
            canShowCheckbox = false;
          } else if (
            mandataris.isStrictBurgemeester &&
            uri === MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE
          ) {
            canShowCheckbox = false;
          }
          return {
            mandataris,
            canShowCheckbox,
          };
        })
      );
    }
    return {
      mandatarissenMap,
      mandatarissen,
      effectiefIsLastStatus,
      bestuursorgaan: parentModel.bestuursorgaan,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      currentBestuursorgaan: currentBestuursorgaan,
    };
  }
}
