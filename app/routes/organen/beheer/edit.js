import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganenBeheerEditRoute extends Route {
  @service store;

  async model(params) {
    const bestuursorgaan = await this.store.findRecord(
      'bestuursorgaan',
      params.orgaan_id,
      {
        include: 'classificatie,heeft-tijdsspecialisaties',
      }
    );
    return bestuursorgaan;
  }
}
