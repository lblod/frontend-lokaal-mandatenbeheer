import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganenOrgaanMandatenRoute extends Route {
  @service store;

  async model() {
    const { currentBestuursorgaan } = this.modelFor('organen.orgaan');

    const mandaten = await currentBestuursorgaan.bevat;

    return {
      mandaten,
      currentBestuursorgaan,
    };
  }
}
