import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getForm } from 'frontend-lmb/utils/get-form';
import { CONTACTINFO_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class LeidinggevendenbeheerBestuursfunctiesBestuursfunctieContactInfoRoute extends Route {
  @service store;

  async model() {
    const bestuurseenheid = this.modelFor('leidinggevendenbeheer');
    const bestuursfunctie = this.modelFor(
      'leidinggevendenbeheer.bestuursfunctie'
    );

    let info = await bestuursfunctie.contactinfo;
    if (!info) {
      info = await this.store.createRecord('contact-punt');
      await info.save();

      bestuursfunctie.set('contactinfo', info);
      await bestuursfunctie.save();
    }

    const form = await getForm(this.store, CONTACTINFO_FORM_ID);

    return {
      bestuurseenheid,
      bestuursfunctie,
      info,
      form,
    };
  }
}
