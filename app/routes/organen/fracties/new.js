import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { FRACTIE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';

export default class FractiesNewRoute extends Route {
  @service store;

  async model() {
    const form = await getFormFrom(this.store, FRACTIE_FORM_ID);
    const parentModel = await this.modelFor('organen.fracties');
    const defaultFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);

    return {
      form,
      defaultFractieType,
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursorganen: parentModel.bestuursorganen,
    };
  }
}
