import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MandatenbeheerBestuursorganenEditRoute extends Route {
  @service store;
  async model(params) {
    const bestuursorgaan = await this.store.findRecord(
      'bestuursorgaan',
      params.id,
      {
        include: 'classificatie,heeft-tijdsspecialisaties',
      }
    );
    return bestuursorgaan;
  }
}
