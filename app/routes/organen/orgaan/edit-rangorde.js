import Route from '@ember/routing/route';

import { service } from '@ember/service';

export default class EditRangordeRoute extends Route {
  @service store;
  @service('mandatarissen') mandatarissenService;

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const bestuursorgaanInTijd = await parentModel.currentBestuursorgaan;

    let mandatarissen;

    if (bestuursorgaanInTijd) {
      mandatarissen = await this.mandatarissenService.getMandatarissen(
        params,
        bestuursorgaanInTijd
      );
    }

    return {
      bestuursorgaan: parentModel.bestuursorgaan,
      bestuursorgaanInTijd,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarissen,
    };
  }
}
