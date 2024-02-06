import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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

    let adres = await info.adres;
    if (!adres) {
      adres = await this.store.createRecord('adres');
      await adres.save();

      info.set('adres', adres);
      await info.save();
    }

    return {
      bestuurseenheid,
      bestuursfunctie,
      info,
    };
  }
}
