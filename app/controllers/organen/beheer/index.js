import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganenBeheerIndexController extends Controller {
  @service router;
  @service store;

  sort = 'naam';

  @action
  createNewOrgaan() {
    this.router.transitionTo('organen.beheer.new');
  }

  @action
  async archiveOrgaan(orgaan) {
    orgaan.deactivatedAt = new Date();
    await orgaan.save();
    this.send('reloadModel');
  }

  @action
  async deArchiveOrgaan(orgaan) {
    orgaan.deactivatedAt = undefined;
    await orgaan.save();
    this.send('reloadModel');
  }
}
