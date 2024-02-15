import Route from '@ember/routing/route';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

import { inject as service } from '@ember/service';

export default class MandatenbeheerBestuursorganenNewRoute extends Route {
  @service store;
  async model() {
    const form = await getFormFrom(this.store, BESTUURSORGAAN_FORM_ID);

    return {
      bestuurseenheid: this.modelFor('mandatenbeheer').bestuurseenheid,
      form,
    };
  }
}
