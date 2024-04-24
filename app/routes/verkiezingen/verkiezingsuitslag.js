import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class VerkiezingenVerkiezingsuitslagRoute extends Route {
  @service store;

  async model(params) {
    const ivStatuses = await this.store.findAll(
      'installatievergadering-status'
    );
    // This query returns a single installatievergadering wrapped in an array
    const installatievergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[bestuursorgaan-in-tijd][id]': params.bestuursorgaan_in_tijd_id,
        include: 'status',
      }
    );
    const installatievergadering = installatievergaderingen[0];
    const selectedStatus = installatievergadering.get('status');

    return {
      ivStatuses,
      selectedStatus,
      installatievergadering,
    };
  }
}
