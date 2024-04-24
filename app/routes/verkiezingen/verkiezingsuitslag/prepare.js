import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;

  async model() {
    const parentModel = this.modelFor('verkiezingen.verkiezingsuitslag');
    const installatievergadering = parentModel.installatievergadering;
    const ivStatuses = await this.store.findAll(
      'installatievergadering-status'
    );
    const selectedStatus = installatievergadering.get('status');

    return {
      installatievergadering,
      ivStatuses,
      selectedStatus,
    };
  }
}
